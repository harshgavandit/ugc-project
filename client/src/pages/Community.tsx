import { useEffect, useMemo, useState } from "react";
import "../components/Community.css";

type Post = {
  id: number;
  title: string;
  author: string;
  image: string;
  thumb: string;
  prompt: string;
  likes: number;
  tags: string[];
  createdAt: number;
  spotlightScore: number;
  liked?: boolean;
};

const samplePosts: Post[] = Array.from({ length: 12 }).map((_, i) => {
  const id = i + 1;
  const tags = ["photoreal", "fantasy", "retro", "portrait", "landscape", "synthwave"];
  const t = tags[i % tags.length];
  return {
    id,
    title: `Community creation #${id}`,
    author: `user${(i % 6) + 1}`,
    image: `https://picsum.photos/seed/ugc-${id}/900/600`,
    thumb: `https://picsum.photos/seed/ugc-${id}/600/400`,
    prompt: `A ${t} scene with cinematic lighting, ultra-detailed — prompt seed ${id}`,
    likes: Math.floor(Math.random() * 250),
    tags: [t, i % 3 === 0 ? "experimental" : "studio"],
    createdAt: Date.now() - i * 1000 * 60 * 60 * 24,
    spotlightScore: Math.random(),
  };
});

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [modal, setModal] = useState<Post | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // derived tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [posts]);

  // filtered posts
  const visible = posts.filter((p) => {
    const matchesQuery =
      query === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.prompt.toLowerCase().includes(query.toLowerCase()) ||
      p.author.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !activeTag || p.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  // shuffle spotlight every 7s
  useEffect(() => {
    const t = setInterval(() => {
      setSpotlightIndex((s) => (s + 1) % posts.length);
    }, 7000);
    return () => clearInterval(t);
  }, [posts.length]);

  function toggleLike(id: number) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
    );
  }

  function shuffleSpotlight() {
    setSpotlightIndex(Math.floor(Math.random() * posts.length));
  }

  function openModal(post: Post) {
    setModal(post);
  }

  function closeModal() {
    setModal(null);
  }

  function generateSimilar(prompt: string) {
    // Example: open composer prefilled — implement actual navigation to your generator
    alert("Open generator with prompt:\n\n" + prompt);
  }

  const spotlightPost = visible[spotlightIndex % Math.max(1, visible.length)] || visible[0];

  return (
    <div className="community-page">
      <header className="community-header">
        <div>
          <h1>Community</h1>
          <p className="sub">See what others are creating with UGC.ai</p>
        </div>

        <div className="controls">
          <input

           // value={query}
            //onChange={(e) => setQuery(e.target.value)}
          />

          <div className="tag-list" role="list">
            <button
              className={`tag ${activeTag === null ? "active" : ""}`}
              onClick={() => setActiveTag(null)}
              title="Show all"
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                className={`tag ${activeTag === t ? "active" : ""}`}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="spotlight">
        {spotlightPost ? (
          <>
            <div
              className="spotlight-bg"
              style={{ backgroundImage: `url(${spotlightPost.image})` }}
              aria-hidden
            />
            <div className="spotlight-card">
              <div>
                <div className="eyebrow">Spotlight</div>
                <h2>{spotlightPost.title}</h2>
                <p className="muted">by {spotlightPost.author} • {spotlightPost.tags.join(", ")}</p>
                <p className="prompt-preview">{spotlightPost.prompt}</p>
                <div className="spot-actions">
                  <button className="primary" onClick={() => openModal(spotlightPost)}>View</button>
                  <button className="ghost" onClick={() => generateSimilar(spotlightPost.prompt)}>Generate similar</button>
                  <button className="ghost" onClick={shuffleSpotlight}>Shuffle</button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <main className="mosaic-wrapper">
        <div className="mosaic">
          {visible.length === 0 ? (
            <div className="empty">No results. Try clearing the search or tag filter.</div>
          ) : (
            visible.map((p, i) => (
              <article
                key={p.id}
                className="mosaic-tile"
                style={{ gridRowEnd: `span ${2 + (i % 3)}` }}
                onClick={() => openModal(p)}
                tabIndex={0}
                role="button"
                aria-label={`Open ${p.title}`}
              >
                <img src={p.thumb} alt={p.title} loading="lazy" />
                <div className="tile-overlay">
                  <div className="tile-meta">
                    <strong>{p.title}</strong>
                    <span className="muted">by {p.author}</span>
                  </div>

                  <div className="tile-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(p.id);
                      }}
                      aria-pressed={!!p.liked}
                      title="Like"
                    >
                      ♥ {p.likes}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={closeModal} aria-label="Close">&times;</button>
            <div className="modal-grid">
              <img src={modal.image} alt={modal.title} />
              <div className="modal-info">
                <h3>{modal.title}</h3>
                <p className="muted">by {modal.author} • {new Date(modal.createdAt).toLocaleDateString()}</p>
                <p className="prompt">{modal.prompt}</p>
                <div className="modal-tags">
                  {modal.tags.map((t) => (<span key={t} className="pill">{t}</span>))}
                </div>
                <div className="modal-actions">
                  <button className="primary" onClick={() => generateSimilar(modal.prompt)}>Generate similar</button>
                  <button className="ghost" onClick={() => { navigator.clipboard?.writeText(modal.prompt); alert("Prompt copied"); }}>Copy Prompt</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}