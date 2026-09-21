import { createFileRoute, Navigate } from "@tanstack/react-router";
import { requireStaff } from "@/lib/admin-guard";
export const Route=createFileRoute("/_authenticated/admin/operations")({beforeLoad:requireStaff,head:()=>({meta:[{title:"Produção — Shape Is Money"},{name:"description",content:"Central de produção e entrega."},{property:"og:title",content:"Produção — Shape Is Money"},{property:"og:description",content:"Central de produção e entrega."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:()=> <Navigate to="/admin/production" replace/>});
