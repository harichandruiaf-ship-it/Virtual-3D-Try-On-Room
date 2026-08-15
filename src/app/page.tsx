import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-room-bg">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Virtual 3D Try-On Room
        </h1>
        <p className="text-room-muted text-lg">
          Upload a photo of yourself. We build a 3D model of your body and face,
          then you try on clothes from the catalog and see how they look before
          you buy.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/upload"
            className="px-6 py-3 rounded-xl bg-room-accent text-white font-medium hover:opacity-90 transition"
          >
            Create my 3D model
          </Link>
          <Link
            href="/room"
            className="px-6 py-3 rounded-xl border border-room-border text-room-muted font-medium hover:border-room-accent hover:text-white transition"
          >
            Go to try-on room
          </Link>
          <Link
            href="/admin/catalog-tools"
            className="px-6 py-3 rounded-xl border border-room-border text-room-muted text-sm font-medium hover:border-room-accent hover:text-white transition"
          >
            Catalog 3D (Rodin)
          </Link>
          <Link
            href="/library"
            className="px-6 py-3 rounded-xl border border-room-border text-room-muted text-sm font-medium hover:border-room-accent hover:text-white transition"
          >
            Model library
          </Link>
        </div>
        <ul className="text-left text-room-muted space-y-2 pt-8 border-t border-room-border">
          <li>• Face structure and body proportions from your reference</li>
          <li>• Height, wrist, arm and full body measurements</li>
          <li>• Browse catalog and dress your 3D avatar</li>
          <li>• Embeddable widget and headless API for e-commerce</li>
        </ul>
      </div>
    </main>
  );
}
