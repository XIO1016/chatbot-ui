import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"
import { redirect } from "next/navigation"

// Get the home workspace by user ID
export const getHomeWorkspaceByUserId = async (
  userId: string
): Promise<string> => {
  const { data: homeWorkspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .eq("is_home", true)
    .single()

  if (error || !homeWorkspace) {
    throw new Error(error?.message || "Failed to fetch home workspace.")
  }

  return homeWorkspace.id
}

// Get a workspace by ID
export const getWorkspaceById = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single()

  if (error) {
    throw new Error(error.message || "Failed to fetch workspace.")
  }

  if (!workspace) {
    redirect(`/`) // Handle redirection in proper contexts
  }

  return workspace
}

// Get all workspaces by user ID
export const getWorkspacesByUserId = async (userId: string) => {
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !workspaces) {
    throw new Error(error?.message || "Failed to fetch workspaces.")
  }

  return workspaces
}

// Create a new workspace
export const createWorkspace = async (
  workspace: TablesInsert<"workspaces">
) => {
  const { data: createdWorkspace, error } = await supabase
    .from("workspaces")
    .insert([workspace])
    .select("*")
    .single()

  if (error || !createdWorkspace) {
    throw new Error(error?.message || "Failed to create workspace.")
  }

  return createdWorkspace
}

// Update an existing workspace
export const updateWorkspace = async (
  workspaceId: string,
  workspace: TablesUpdate<"workspaces">
) => {
  const { data: updatedWorkspace, error } = await supabase
    .from("workspaces")
    .update(workspace)
    .eq("id", workspaceId)
    .select("*")
    .single()

  if (error || !updatedWorkspace) {
    throw new Error(error?.message || "Failed to update workspace.")
  }

  return updatedWorkspace
}

// Delete a workspace
export const deleteWorkspace = async (
  workspaceId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message || "Failed to delete workspace.")
  }

  return true
}
