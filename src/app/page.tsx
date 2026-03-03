// Home page — immediately redirects to /feed.
// This means visiting localhost:3000 takes you straight to the event feed.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/feed");
}
