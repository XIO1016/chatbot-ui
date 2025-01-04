// "use client";

// import { useRouter } from "next/navigation";
// import { useState, useContext , useEffect} from "react";
// import { ChatbotUIContext } from "@/context/context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { getHomeWorkspaceByUserId, getWorkspacesByUserId, updateWorkspace } from "@/db/workspaces";
// import { supabase } from "@/lib/supabase/browser-client";
// import { createClient } from "@/lib/supabase/server";
// import { getProfileByUserId, updateProfile } from "@/db/profile";
// import { TablesUpdate } from "@/supabase/types";
// import { User } from "@supabase/supabase-js";
// import Loading from "../loading";

// export default function SignUpPage() {
//   const router = useRouter();
//   const { setProfile } = useContext(ChatbotUIContext);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [displayName, setDisplayName] = useState("");
//   const [email, setEmail] = useState("");
//   const [usernameAvailable, setUsernameAvailable] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [verifyingEmail, setVerifyingEmail] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [usernameError, setUsernameError] = useState("");
//   const [signupErrorMessage, setSignupErrorMessage] = useState("");

//   const validateUsername = (value: string) => {
//     if (value.length < 4) {
//       setUsernameError("사용자 이름은 최소 4자여야 합니다.");
//       return false;
//     }
//     if (!/^[a-zA-Z0-9_]+$/.test(value)) {
//       setUsernameError("Username can only contain letters, numbers, and underscores");
//       return false;
//     }
//     setUsernameError("");
//     return true;
//   };

//   useEffect(() => {
//     if (username) {
//       validateUsername(username);
//     }
//   }, [username]);

//   const checkUsernameAvailability = async () => {
//     if (!username || !supabase) {
//       setErrorMessage("Please enter a username");
//       return;
//     }

//     if (!validateUsername(username)) {
//       return;
//     }

//     setCheckingUsername(true);
//     setErrorMessage("");

//     try {
//       const { data, error } = await supabase
//         .rpc('check_username_availability', { username: username });

//       if (error) throw error;

//       setUsernameAvailable(data);
//     } catch (error:any) {
//       console.error('Error checking username:', error);
//       setErrorMessage(Error checking username: ${error.message});
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   const verifyEmail = async () => {
//     // TODO
//     console.log("VERIFY")
//     setEmailVerified(true);
//     // if (!email) {
//     //   setErrorMessage("Please enter an email address");
//     //   return;
//     // }

//     // setVerifyingEmail(true);
//     // setErrorMessage("");

//     // try {
//     //   const { error } = await supabase.auth.signInWithOtp({
//     //     email: email,
//     //     options: {
//     //       emailRedirectTo: ${window.location.origin}/auth/callback,
//     //     },
//     //   });

//     //   if (error) throw error;

//     //   setEmailVerified(true);
//     //   alert("Verification email sent. Please check your inbox.");
//     // } catch (error) {
//     //   console.error('Error verifying email:', error);
//     //   setErrorMessage(Error verifying email: ${error.message});
//     //   setEmailVerified(false);
//     // } finally {
//     //   setVerifyingEmail(false);
//     // }
//   };

//   const handleSaveSetupSetting = async () => {
//     setLoading(true); // Start loading

//     try {
//       const session = (await supabase.auth.getSession()).data.session;
//       if (!session) {
//         return router.push("/login");
//       }

//       const user = session.user;
//       const profile = await getProfileByUserId(user.id);

//       const updateProfilePayload: TablesUpdate<"profiles"> = {
//         ...profile,
//         has_onboarded: true,
//         display_name: displayName,
//         username: username,
//         openai_api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//       };

//       const updatedProfile = await updateProfile(profile.id, updateProfilePayload);
//       setProfile(updatedProfile);

//       const workspaces = await getWorkspacesByUserId(profile.user_id);
//       const homeWorkspace = workspaces.find((w) => w.is_home);

//       const newWorkspaces = await updateWorkspace(homeWorkspace!.id, {
//         ...homeWorkspace,
//         default_model: "gpt-4o",
//         default_prompt:
//           "You are a helpful assistant for Korean transaction intermediary. Match sellers and buyers by checking the current inventory of sellers and the purchase requests from buyers. Preferred language is Korean. Try to make responses in Korean except for inquiry emails, which should be written in the seller's preferred language (e.g., English). Email contents should be confirmed by the user before sending. The user is using a premium account. The user name is " +
//           profile.username,
//       });

//       await handleSaveEmailAccount(user);

//       return router.push(/${homeWorkspace?.id}/chat);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   const handleSaveEmailAccount = async (user: User) => {

//     const c = {
//       email: user.email,
//       email_key: "",
//       user_id: user.id
//     }
//     const { data, error } = await supabase
//     .from("email_account")
//     .insert([c])
//     .select("*")
//   }
//   const sendUserData = async (email: string, password: string) => {
//     try {
//       const response = await fetch('/api/email/create_account', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         console.log('User data sent successfully:', data);
//       } else {
//         console.error('Failed to send user data:', data);
//       }
//     } catch (error) {
//       console.error('Error calling send-user-data API:', error);
//     }
//   };

//   const handleSignUp = async () => {
//     if (!emailVerified) {
//       setSignupErrorMessage("Please verify your email before signing up.");
//       return;
//     }

//     setLoading(true);
//     setSignupErrorMessage("");

//     try {
//       const { data: { user }, error } = await supabase.auth.signUp({
//         email: username + "@mail.anthrometa.com",
//         password: password,
//         options: {
//           data: {
//             username: username,
//             display_name: displayName,
//           }
//         }
//       });

//       if (error) throw error;

//       if (user) {
//         // 유저 생성 성공 시 외부 API로 HTTP 요청을 전송합니다.
//         sendUserData(username+"@mail.anthrometa.com",password);
//         await handleSaveSetupSetting();

//       } else {
//         setSignupErrorMessage("Please check your email for the confirmation link to complete your registration.");
//       }

//     } catch (error: any) {
//       console.error('Error signing up:', error);
//       if (error.message.includes("duplicate key value violates unique constraint")) {
//         setSignupErrorMessage("This username or email is already in use. Please choose another.");
//       } else if (error.message.includes("Password should be at least 6 characters")) {
//         setSignupErrorMessage("Password should be at least 6 characters long.");
//       } else if (error.message.includes("weak password")) {
//         setSignupErrorMessage("Your password is too weak. Please use a stronger password.");
//       } else {
//         setSignupErrorMessage(Error signing up: ${error.message});
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleSignUp = async () => {
//   //   if (!emailVerified) {
//   //     setSignupErrorMessage("Please verify your email before signing up.");
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   setSignupErrorMessage("");

//   //   try {
//   //     const { data: { user }, error } = await supabase.auth.signUp({
//   //       email: username + "@mail.anthrometa.com",
//   //       password: password,
//   //       options: {
//   //         data: {
//   //           username: username,
//   //           display_name: displayName,
//   //         }
//   //       }
//   //     });

//   //     if (error) throw error;

//   //     // if (user) {
//   //     //   try {
//   //     //     await supabase.from('profiles').insert({
//   //     //       id: user.id,
//   //     //       username: username,
//   //     //       display_name: displayName,
//   //     //     });

//   //     //     setProfile({ id: user.id, username, display_name: displayName });
//   //     //     router.push("/setup");
//   //     //   } catch (profileError) {
//   //     //     console.error('Error creating profile:', profileError);
//   //     //     setErrorMessage(Error creating profile: ${profileError.message});
//   //     //   }
//   //     // } else {
//   //     //   setErrorMessage("Please check your email for the confirmation link to complete your registration.");
//   //     // }
//   //   } catch (error) {
//   //     console.error('Error signing up:', error);
//   //     if (error.message.includes("duplicate key value violates unique constraint")) {
//   //       setSignupErrorMessage("This username or email is already in use. Please choose another.");
//   //     } else if (error.message.includes("Password should be at least 6 characters")) {
//   //       setSignupErrorMessage("Password should be at least 6 characters long.");
//   //     } else {
//   //       setSignupErrorMessage(Error signing up: ${error.message});
//   //     }
//   //   } finally {
//   //     setLoading(false);
//   //     handleSaveSetupSetting();

//   //   }
//   // };

//   return (

//    <div className="flex flex-col items-center justify-center min-h-screen p-4">
//     {loading && (
//         <Loading />
//       )}
//       <div className="w-full max-w-md space-y-8">
//         <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>

//         <div className="space-y-4">
//         <div className="space-y-2 w-[450px]">
//           <Label htmlFor="username">Username</Label>
//           <div className="flex space-x-2">
//             <Input
//               id="username"
//               type="text"
//               placeholder="Enter username (4+ characters, no special chars)"
//               value={username}
//               onChange={(e) => {
//                 setUsername(e.target.value);
//                 setUsernameAvailable(null);
//               }}
//               className="" // 너비 고정, max-width 설정
//             />
//             <Button
//               onClick={checkUsernameAvailability}
//               variant="outline"
//               className="w-32 h-10 flex items-center justify-center whitespace-nowrap"
//               disabled={checkingUsername || !username || !!usernameError}
//             >
//               {checkingUsername ? "checking..." : "check"}
//             </Button>
//           </div>

//           <div className="">
//             {usernameError && (
//               <p className="text-red-500 text-sm mt-1">{usernameError}</p>
//             )}
//             {usernameAvailable !== null && !usernameError && (
//               <p className={usernameAvailable ? "text-green-500" : "text-red-500"}>
//                 {usernameAvailable ? "Username is available" : "Username is already taken"}
//               </p>
//             )}
//           </div>
//         </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full" // {{ edit_2 }}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="displayName">Display Name</Label>
//             <Input
//               id="displayName"
//               type="text"
//               placeholder="Enter display name"
//               value={displayName}
//               onChange={(e) => setDisplayName(e.target.value)}
//               className="w-full" // {{ edit_3 }}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <div className="flex space-x-2">
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter email"
//                 value={email}
//                 onChange={(e) => {
//                   setEmail(e.target.value);
//                   setEmailVerified(false);
//                 }}
//                 className="flex-grow w-full" // {{ edit_4 }}
//               />
//               <Button
//                 onClick={verifyEmail}
//                 variant="outline"
//                 className="w-32 h-10 flex items-center justify-center whitespace-nowrap"
//                 disabled={verifyingEmail || !email || emailVerified}
//               >
//                 {verifyingEmail ? "Verifying..." : emailVerified ? "Verified" : "Verify Email"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         <Button
//           onClick={handleSignUp}
//           disabled={!username || !usernameAvailable || !!usernameError || !password || !email || !emailVerified || loading}
//           className="w-full mt-6"
//         >
//           {loading ? "Signing Up..." : "Sign Up"}
//         </Button>
//         {signupErrorMessage && (
//           <Alert variant="destructive" className="mb-4 bg-red-100 border-red-400 text-red-700">
//             <AlertDescription className="font-semibold">{signupErrorMessage}</AlertDescription>
//             </Alert>
//         )}
//       </div>
//     </div>
//   );
// }
