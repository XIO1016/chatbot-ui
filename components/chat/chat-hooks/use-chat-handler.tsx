import { ChatbotUIContext } from "@/context/context"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { updateChat } from "@/db/chats"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { deleteMessagesIncludingAndAfter } from "@/db/messages"
import { buildFinalMessages } from "@/lib/build-prompt"
import { Tables } from "@/supabase/types"
import {
  ChatMessage,
  ChatPayload,
  ChatSettings,
  LLMID,
  ModelProvider
} from "@/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import { LLM_LIST } from "../../../lib/models/llm/llm-list"
import {
  createTempMessages,
  handleCreateChat,
  handleCreateMessages,
  handleHostedChat,
  handleRetrieval,
  validateChatSettings
} from "../chat-helpers"
import { Email } from "@/types/email"
import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"

export const useChatHandler = () => {
  const router = useRouter()

  const {
    userInput,
    chatFiles,
    setUserInput,
    setNewMessageImages,
    profile,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    selectedWorkspace,
    setSelectedChat,
    setChats,
    setSelectedTools,
    availableLocalModels,
    availableOpenRouterModels,
    abortController,
    setAbortController,
    chatSettings,
    newMessageImages,
    selectedAssistant,
    chatMessages,
    chatImages,
    setChatImages,
    setChatFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    newMessageFiles,
    chatFileItems,
    setChatFileItems,
    setToolInUse,
    useRetrieval,
    sourceCount,
    setIsPromptPickerOpen,
    setIsFilePickerOpen,
    selectedTools,
    selectedPreset,
    setChatSettings,
    models,
    isPromptPickerOpen,
    isFilePickerOpen,
    isToolPickerOpen,
    toolCommand
  } = useContext(ChatbotUIContext)

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isPromptPickerOpen || !isFilePickerOpen || !isToolPickerOpen) {
      chatInputRef.current?.focus()
    }
  }, [isPromptPickerOpen, isFilePickerOpen, isToolPickerOpen])

  const handleNewChat = async () => {
    if (!selectedWorkspace) return

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    setChatFileItems([])

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
    setIsPromptPickerOpen(false)
    setIsFilePickerOpen(false)

    setSelectedTools([])
    setToolInUse("none")

    if (selectedAssistant) {
      setChatSettings({
        model: selectedAssistant.model as LLMID,
        prompt: selectedAssistant.prompt,
        temperature: selectedAssistant.temperature,
        contextLength: selectedAssistant.context_length,
        includeProfileContext: selectedAssistant.include_profile_context,
        includeWorkspaceInstructions:
          selectedAssistant.include_workspace_instructions,
        embeddingsProvider: selectedAssistant.embeddings_provider as
          | "openai"
          | "local"
      })

      let allFiles = []

      const assistantFiles = (
        await getAssistantFilesByAssistantId(selectedAssistant.id)
      ).files
      allFiles = [...assistantFiles]
      const assistantCollections = (
        await getAssistantCollectionsByAssistantId(selectedAssistant.id)
      ).collections
      for (const collection of assistantCollections) {
        const collectionFiles = (
          await getCollectionFilesByCollectionId(collection.id)
        ).files
        allFiles = [...allFiles, ...collectionFiles]
      }
      const assistantTools = (
        await getAssistantToolsByAssistantId(selectedAssistant.id)
      ).tools

      setSelectedTools(assistantTools)
      setChatFiles(
        allFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          file: null
        }))
      )

      if (allFiles.length > 0) setShowFilesDisplay(true)
    } else if (selectedPreset) {
      setChatSettings({
        model: selectedPreset.model as LLMID,
        prompt: selectedPreset.prompt,
        temperature: selectedPreset.temperature,
        contextLength: selectedPreset.context_length,
        includeProfileContext: selectedPreset.include_profile_context,
        includeWorkspaceInstructions:
          selectedPreset.include_workspace_instructions,
        embeddingsProvider: selectedPreset.embeddings_provider as
          | "openai"
          | "local"
      })
    } else if (selectedWorkspace) {
      // setChatSettings({
      //   model: (selectedWorkspace.default_model ||
      //     "gpt-4-1106-preview") as LLMID,
      //   prompt:
      //     selectedWorkspace.default_prompt ||
      //     "You are a friendly, helpful AI assistant.",
      //   temperature: selectedWorkspace.default_temperature || 0.5,
      //   contextLength: selectedWorkspace.default_context_length || 4096,
      //   includeProfileContext:
      //     selectedWorkspace.include_profile_context || true,
      //   includeWorkspaceInstructions:
      //     selectedWorkspace.include_workspace_instructions || true,
      //   embeddingsProvider:
      //     (selectedWorkspace.embeddings_provider as "openai" | "local") ||
      //     "openai"
      // })
    }

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleFocusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const handleStopMessage = () => {
    if (abortController) {
      abortController.abort()
    }
  }
  const handleSendTools = async (
    messageContent: string,
    chatMessages: ChatMessage[],
    isRegeneration: boolean
  ) => {
    const startingInput = messageContent

    try {
      setUserInput("")
      setIsGenerating(true)
      setIsPromptPickerOpen(false)
      setIsFilePickerOpen(false)
      setNewMessageImages([])

      const newAbortController = new AbortController()
      setAbortController(newAbortController)

      const modelData = [
        ...models.map(model => ({
          modelId: model.model_id as LLMID,
          modelName: model.name,
          provider: "custom" as ModelProvider,
          hostedId: model.id,
          platformLink: "",
          imageInput: false
        })),
        ...LLM_LIST,
        ...availableLocalModels,
        ...availableOpenRouterModels
      ].find(llm => llm.modelId === chatSettings?.model)

      validateChatSettings(
        chatSettings,
        modelData,
        profile,
        selectedWorkspace,
        messageContent
      )

      let currentChat = selectedChat ? { ...selectedChat } : null

      const b64Images = newMessageImages.map(image => image.base64)

      let retrievedFileItems: Tables<"file_items">[] = []

      if (
        (newMessageFiles.length > 0 || chatFiles.length > 0) &&
        useRetrieval
      ) {
        setToolInUse("retrieval")

        retrievedFileItems = await handleRetrieval(
          userInput,
          newMessageFiles,
          chatFiles,
          chatSettings!.embeddingsProvider,
          sourceCount
        )
      }

      let tempUserChatMessage: ChatMessage = {
        message: {
          chat_id: "",
          assistant_id: null,
          content: messageContent,
          created_at: "",
          id: uuidv4(),
          image_paths: b64Images,
          model: chatSettings?.model ?? "gpt-4o",
          role: "user",
          sequence_number: chatMessages.length,
          updated_at: "",
          user_id: ""
        },
        fileItems: []
      }

      let tempAssistantChatMessage: ChatMessage = {
        message: {
          chat_id: "",
          assistant_id: selectedAssistant?.id || null,
          content: "",
          created_at: "",
          id: uuidv4(),
          image_paths: [],
          model: chatSettings?.model ?? "gpt-4o",
          role: "assistant",
          sequence_number: chatMessages.length + 1,
          updated_at: "",
          user_id: ""
        },
        fileItems: []
      }
      const newMessages = [
        ...chatMessages,
        tempUserChatMessage,
        tempAssistantChatMessage
      ]

      setChatMessages(newMessages)

      console.log("1: createTempMessages")
      console.log(tempUserChatMessage)

      // let payload: ChatPayload = {
      //     chatSettings: chatSettings!,
      //     workspaceInstructions: selectedWorkspace!.instructions || "",
      //     chatMessages: isRegeneration
      //         ? [...chatMessages]
      //         : [...chatMessages, tempUserChatMessage],
      //     assistant: selectedChat?.assistant_id ? selectedAssistant : null,
      //     messageFileItems: retrievedFileItems,
      //     chatFileItems: chatFileItems
      // }
      // console.log("2: payload")
      // console.log(payload)

      let generatedText = ""

      console.log("3. toolCommand")
      console.log(toolCommand)

      // }
      // if (selectedTools.length > 0) {
      setToolInUse("Tools")

      if (!currentChat) {
        currentChat = await handleCreateChat(
          chatSettings!,
          profile!,
          selectedWorkspace!,
          messageContent,
          selectedAssistant!,
          newMessageFiles,
          setSelectedChat,
          setChats,
          setChatFiles,
          ""
        )
      }

      const answer = await chatWithAssistant(
        tempUserChatMessage.message.content
      )
      console.log("5. answer ")
      console.log(answer)

      if (answer.type === "action_required") {
        const tool_calls = answer.data

        const promises = tool_calls.map(async (tool_call: any) => {
          console.log("Tool call:", tool_call)
          if (tool_call.function.name === "search_product") {
            console.log(
              "Search product tool call:",
              tool_call.function.arguments
            )

            const product = JSON.parse(tool_call.function.arguments).query
            console.log("Product:", product)
            console.log(tempUserChatMessage)
            console.log(chatMessages)
            console.log(chatSettings)

            generatedText = "상품을 검색합니다: " + product

            let tempAssistantChatMessage: ChatMessage = {
              message: {
                chat_id: currentChat?.id || "",
                assistant_id: selectedAssistant?.id || null,
                content: generatedText,
                created_at: new Date().toISOString(),
                id: uuidv4(),
                image_paths: [],
                model: chatSettings?.model ?? "gpt-4o",
                role: "assistant",
                sequence_number: chatMessages.length + 1,
                updated_at: "",
                user_id: ""
              },
              fileItems: []
            }

            const newMessages = [
              ...chatMessages,
              tempUserChatMessage,
              tempAssistantChatMessage
            ]

            setChatMessages(newMessages)
            setIsGenerating(false)
            setFirstTokenReceived(false)

            setIsGenerating(true)

            let tempAssistantChatMessage2: ChatMessage = {
              message: {
                chat_id: currentChat?.id || "",
                assistant_id: selectedAssistant?.id || null,
                content: "",
                created_at: "",
                id: uuidv4(),
                image_paths: [],
                model: chatSettings?.model ?? "gpt-4o",
                role: "assistant",
                sequence_number: chatMessages.length + 1,
                updated_at: "",
                user_id: ""
              },
              fileItems: []
            }

            const newMessages2 = [...newMessages, tempAssistantChatMessage2]

            setChatMessages(newMessages2)

            let payload: ChatPayload = {
              chatSettings: chatSettings!,
              workspaceInstructions: selectedWorkspace!.instructions || "",
              chatMessages: isRegeneration ? [...chatMessages] : newMessages2,
              assistant: selectedChat?.assistant_id ? selectedAssistant : null,
              messageFileItems: retrievedFileItems,
              chatFileItems: chatFileItems
            }
            console.log("2: payload")
            console.log(payload)
            // const formattedMessages = await buildFinalMessages(
            //     payload,
            //     profile!,
            //     chatImages
            // )
            // console.log("4. formattedMessages")
            // console.log(formattedMessages)

            // if (!currentChat) {
            //     currentChat = await handleCreateChat(
            //         chatSettings!,
            //         profile!,
            //         selectedWorkspace!,
            //         messageContent,
            //         selectedAssistant!,
            //         newMessageFiles,
            //         setSelectedChat,
            //         setChats,
            //         setChatFiles
            //     )
            // } else {
            // const updatedChat = await updateChat(currentChat.id, {
            //     updated_at: new Date().toISOString()
            // })
            //
            // setChats(prevChats => {
            //     const updatedChats = prevChats.map(prevChat =>
            //         prevChat.id === updatedChat.id ? updatedChat : prevChat
            //     )
            //
            //     return updatedChats
            // })
            // }
            // console.log(chatMessages)

            const response = await fetch("/api/chat/tools", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                chatSettings: payload.chatSettings,
                message: product,
                selectedTools: toolCommand,
                toolCall: tool_call
              })
            })

            const get_prod_prompt = await fetch(
              "/api/assistants/get_product_prompt",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  outputs: [
                    {
                      tool_call_id: tool_call.id,
                      output: JSON.stringify((await response.json()).result)
                    }
                  ],
                  answer: answer
                })
              }
            )
            console.log("get_prod_prompt" + get_prod_prompt)
            const generatedText2 = (await get_prod_prompt.json()).assistant
            //
            await handleCreateMessages(
              chatMessages,
              currentChat!,
              profile!,
              modelData!,
              messageContent,
              generatedText2,
              newMessageImages,
              isRegeneration,
              retrievedFileItems,
              setChatMessages,
              setChatFileItems,
              setChatImages,
              selectedAssistant,
              true,
              generatedText
            )

            setIsGenerating(false)
            setFirstTokenReceived(false)

            return
          }
        })
      }

      //
    } catch (error) {
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(startingInput)
    }
  }
  const handleSendMessage = async (
    messageContent: string,
    chatMessages: ChatMessage[],
    isRegeneration: boolean
  ) => {
    if (messageContent.startsWith("!")) {
      await handleSendTools(messageContent, chatMessages, isRegeneration)
      return
    }

    const startingInput = messageContent

    try {
      setUserInput("")
      setIsGenerating(true)
      setIsPromptPickerOpen(false)
      setIsFilePickerOpen(false)
      setNewMessageImages([])

      const newAbortController = new AbortController()
      setAbortController(newAbortController)

      const modelData = [
        ...models.map(model => ({
          modelId: model.model_id as LLMID,
          modelName: model.name,
          provider: "custom" as ModelProvider,
          hostedId: model.id,
          platformLink: "",
          imageInput: false
        })),
        ...LLM_LIST,
        ...availableLocalModels,
        ...availableOpenRouterModels
      ].find(llm => llm.modelId === chatSettings?.model)

      validateChatSettings(
        chatSettings,
        modelData,
        profile,
        selectedWorkspace,
        messageContent
      )

      let currentChat = selectedChat ? { ...selectedChat } : null

      const b64Images = newMessageImages.map(image => image.base64)

      let retrievedFileItems: Tables<"file_items">[] = []

      if (
        (newMessageFiles.length > 0 || chatFiles.length > 0) &&
        useRetrieval
      ) {
        setToolInUse("retrieval")

        retrievedFileItems = await handleRetrieval(
          userInput,
          newMessageFiles,
          chatFiles,
          chatSettings!.embeddingsProvider,
          sourceCount
        )
      }

      const { tempUserChatMessage, tempAssistantChatMessage } =
        createTempMessages(
          messageContent,
          chatMessages,
          chatSettings!,
          b64Images,
          isRegeneration,
          setChatMessages,
          selectedAssistant,
          0
        )

      let payload: ChatPayload = {
        chatSettings: chatSettings!,
        workspaceInstructions: selectedWorkspace!.instructions || "",
        chatMessages: isRegeneration
          ? [...chatMessages]
          : [...chatMessages, tempUserChatMessage],
        assistant: selectedChat?.assistant_id ? selectedAssistant : null,
        messageFileItems: retrievedFileItems,
        chatFileItems: chatFileItems
      }

      let generatedText = ""

      generatedText = await handleHostedChat(
        payload,
        profile!,
        modelData!,
        tempAssistantChatMessage,
        isRegeneration,
        newAbortController,
        newMessageImages,
        chatImages,
        setIsGenerating,
        setFirstTokenReceived,
        setChatMessages,
        setToolInUse
      )

      //
      if (!currentChat) {
        currentChat = await handleCreateChat(
          chatSettings!,
          profile!,
          selectedWorkspace!,
          messageContent,
          selectedAssistant!,
          newMessageFiles,
          setSelectedChat,
          setChats,
          setChatFiles,
          ""
        )
      } else {
        const updatedChat = await updateChat(currentChat.id, {
          updated_at: new Date().toISOString()
        })

        setChats(prevChats => {
          const updatedChats = prevChats.map(prevChat =>
            prevChat.id === updatedChat.id ? updatedChat : prevChat
          )

          return updatedChats
        })
      }
      console.log(chatMessages)

      await handleCreateMessages(
        chatMessages,
        currentChat!,
        profile!,
        modelData!,
        messageContent,
        generatedText,
        newMessageImages,
        isRegeneration,
        retrievedFileItems,
        setChatMessages,
        setChatFileItems,
        setChatImages,
        selectedAssistant
      )
      //
      setIsGenerating(false)
      setFirstTokenReceived(false)
    } catch (error) {
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(startingInput)
    }
  }

  const handleSendEdit = async (
    editedContent: string,
    sequenceNumber: number
  ) => {
    if (!selectedChat) return

    await deleteMessagesIncludingAndAfter(
      selectedChat.user_id,
      selectedChat.id,
      sequenceNumber
    )

    const filteredMessages = chatMessages.filter(
      chatMessage => chatMessage.message.sequence_number < sequenceNumber
    )

    setChatMessages(filteredMessages)

    handleSendMessage(editedContent, filteredMessages, false)
  }

  const handleEmailChat = async (
    email: Email,
    chatMessages: ChatMessage[],
    isRegeneration: boolean
  ) => {
    const messageContent =
      "이메일 도우미\n" +
      "TITLE: " +
      email.title +
      "\n" +
      "EMAIL_SENDER: " +
      email.sender_email +
      "\n" +
      "EMAIL_DATE: " +
      email.date +
      "\n" +
      "EMAIL_CONTENT: " +
      email.content

    // console.log(messageContent)

    const startingInput = "이메일 도우미:\n" + email.title

    try {
      setUserInput("")
      setIsGenerating(true)
      setIsPromptPickerOpen(false)
      setIsFilePickerOpen(false)
      setNewMessageImages([])

      const newAbortController = new AbortController()
      setAbortController(newAbortController)
      const extractText = (html: string) => {
        const element = document.createElement("div")
        element.innerHTML = html
        return element.textContent || element.innerText || ""
      }

      const messageContent2 =
        "TITLE: " +
        email.title +
        "\n" +
        "EMAIL_SENDER: " +
        email.sender_email +
        "\n" +
        "EMAIL_DATE: " +
        email.date +
        "\n" +
        "EMAIL_CONTENT: " +
        extractText(email.content)

      const tmpChatSettings: ChatSettings = {
        ...chatSettings,
        prompt:
          "You are helpful assistant for Korean transaction intermediary. Answer in Korean." +
          "Please summarize the key points of the following email related to trade." +
          " On the first line, write who sent the email and when, and write the subject of the email(except greetings)." +
          " \n $[Email Content]\n+" +
          messageContent2
      }

      const modelData = [
        ...models.map(model => ({
          modelId: model.model_id as LLMID,
          modelName: model.name,
          provider: "custom" as ModelProvider,
          hostedId: model.id,
          platformLink: "",
          imageInput: false
        })),
        ...LLM_LIST,
        ...availableLocalModels,
        ...availableOpenRouterModels
      ].find(llm => llm.modelId === tmpChatSettings?.model)

      validateChatSettings(
        tmpChatSettings,
        modelData,
        profile,
        selectedWorkspace,
        messageContent
      )

      let currentChat = selectedChat ? { ...selectedChat } : null

      const b64Images = newMessageImages.map(image => image.base64)

      let retrievedFileItems: Tables<"file_items">[] = []

      if (
        (newMessageFiles.length > 0 || chatFiles.length > 0) &&
        useRetrieval
      ) {
        setToolInUse("retrieval")

        retrievedFileItems = await handleRetrieval(
          userInput,
          newMessageFiles,
          chatFiles,
          tmpChatSettings!.embeddingsProvider,
          sourceCount
        )
      }

      const { tempUserChatMessage, tempAssistantChatMessage } =
        createTempMessages(
          messageContent,
          chatMessages,
          tmpChatSettings!,
          b64Images,
          isRegeneration,
          setChatMessages,
          selectedAssistant
        )

      // const messageContent2 =
      //     "TITLE: " + email.title + "\n" +
      //     "EMAIL_SENDER: " + email.sender_email + "\n" +
      //     "EMAIL_DATE: " + email.date + "\n" +
      //     "EMAIL_CONTENT: " + extractText(email.content);

      let payload: ChatPayload = {
        chatSettings: tmpChatSettings!,
        workspaceInstructions: selectedWorkspace!.instructions || "",
        chatMessages: isRegeneration
          ? [...chatMessages]
          : [...chatMessages, tempUserChatMessage],
        assistant: selectedChat?.assistant_id ? selectedAssistant : null,
        messageFileItems: retrievedFileItems,
        chatFileItems: chatFileItems
      }

      const formattedMessages = await buildFinalMessages(
        payload,
        profile!,
        chatImages,
        email
      )

      console.log(formattedMessages)

      let generatedText = ""

      generatedText = await handleHostedChat(
        payload,
        profile!,
        modelData!,
        tempAssistantChatMessage,
        isRegeneration,
        newAbortController,
        newMessageImages,
        chatImages,
        setIsGenerating,
        setFirstTokenReceived,
        setChatMessages,
        setToolInUse
      )

      currentChat = await handleCreateChat(
        chatSettings!,
        profile!,
        selectedWorkspace!,
        messageContent,
        selectedAssistant!,
        newMessageFiles,
        setSelectedChat,
        setChats,
        setChatFiles,
        "[이메일] " + email.title
      )

      //
      // if (!currentChat) {
      //     currentChat = await handleCreateChat(
      //         chatSettings!,
      //         profile!,
      //         selectedWorkspace!,
      //         messageContent,
      //         selectedAssistant!,
      //         newMessageFiles,
      //         setSelectedChat,
      //         setChats,
      //         setChatFiles
      //     )
      // } else {
      //     const updatedChat = await updateChat(currentChat.id, {
      //         updated_at: new Date().toISOString()
      //     })
      //
      //     setChats(prevChats => {
      //         const updatedChats = prevChats.map(prevChat =>
      //             prevChat.id === updatedChat.id ? updatedChat : prevChat
      //         )
      //
      //         return updatedChats
      //     })
      // }

      await handleCreateMessages(
        chatMessages,
        currentChat,
        profile!,
        modelData!,
        messageContent,
        generatedText,
        newMessageImages,
        isRegeneration,
        retrievedFileItems,
        setChatMessages,
        setChatFileItems,
        setChatImages,
        selectedAssistant
      )

      setIsGenerating(false)
      setFirstTokenReceived(false)
    } catch (error) {
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(startingInput)
    }
  }

  return {
    chatInputRef,
    prompt,
    handleNewChat,
    handleSendMessage,
    handleFocusChatInput,
    handleStopMessage,
    handleSendEdit,
    handleEmailChat
  }
}

async function chatWithAssistant(userMessage: string) {
  try {
    // OpenAI 클라이언트 초기화
    const client = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true
    })
    console.log("OpenAI client initialized")

    // Thread 생성
    console.log("Creating new thread...")
    const thread = await client.beta.threads.create()
    console.log("Thread created:", thread)

    // Assistant에게 보낼 요청 본문 구성
    const requestBody = {
      assistantId: "asst_LW1ndDqn9jwnYqNRTFqnD5OD",
      key: "",
      messages: "/search_product " + userMessage.replace("!검색", ""),
      prompt:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      temperature: 1,
      threadId: thread.id
    }
    console.log("Request body prepared:", requestBody)

    // Assistant API 호출
    console.log("Sending request to Assistant API...")
    const assistantResponse = await fetch("/api/assistants/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    if (!assistantResponse.ok) {
      throw new Error(`HTTP error! status: ${assistantResponse.status}`)
    }

    const responseData = await assistantResponse.json()
    console.log("Assistant response received:", responseData)

    return responseData
  } catch (error: unknown) {
    console.error("chatWithAssistant에서 오류 발생:", error)
    if (error instanceof Error) {
      if ("response" in error && error.response) {
        console.error("API 응답 오류:", (error.response as any).data)
      } else if ("request" in error && error.request) {
        console.error("응답을 받지 못했습니다:", error.request)
      } else {
        console.error("Error details:", error.message)
      }
    }
    throw error
  }
}
