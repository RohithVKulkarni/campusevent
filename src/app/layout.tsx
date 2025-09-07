import Providers from "@/components/Providers";


export const metadata = {
  title: "Campus Event Admin Dashboard",
  description: "Admin dashboard for campus event management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
