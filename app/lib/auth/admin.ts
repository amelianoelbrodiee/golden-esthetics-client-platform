import { cookies } from "next/headers";
import { getSupabasePublicClient, getSupabaseUserClient, isSupabaseConfigured } from "../supabase/server";
export type AdminRole="owner"|"admin";
export type AdminSession={userId:string;email:string;displayName:string;role:AdminRole;accessToken:string};
export const accessCookie="ge-admin-access";export const refreshCookie="ge-admin-refresh";
export function getSupabaseAuthClient(){return getSupabasePublicClient()}
export async function getAdminSession():Promise<AdminSession|null>{if(!isSupabaseConfigured())return null;const token=(await cookies()).get(accessCookie)?.value;if(!token)return null;const auth=getSupabaseAuthClient();if(!auth)return null;const{data,error}=await auth.auth.getUser(token);if(error||!data.user)return null;const db=getSupabaseUserClient(token);if(!db)return null;const{data:admin}=await db.from("admin_users").select("role,display_name,active").eq("user_id",data.user.id).eq("active",true).maybeSingle();if(!admin||!(["owner","admin"]as string[]).includes(admin.role))return null;return{userId:data.user.id,email:data.user.email??"",displayName:admin.display_name||data.user.email||"Golden Esthetics",role:admin.role as AdminRole,accessToken:token}}
