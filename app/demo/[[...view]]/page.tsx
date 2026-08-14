import { redirect } from "next/navigation";

export default async function DemoPage() {
  redirect("/sign-in");
}
