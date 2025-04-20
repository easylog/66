// pages/changeboard.js – Web-Version vom ChangeBoard ✨ + Sprachfunktion 🎤
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ChangeBoard() {
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const r = new window.webkitSpeechRecognition();
      r.lang = 'de-DE';
      r.continuous = false;
      r.interimResults = false;
      r.onresult = (event) => {
        setNewPost((prev) => ({ ...prev, content: prev.content + ' ' + event.results[0][0].transcript }));
      };
      r.onend = () => setIsListening(false);
      setRecognition(r);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const loadPosts = (customerId) => {
    setSelectedCustomer(customerId);
    fetch(`/api/changeboard?customerId=${customerId}`)
      .then(res => res.json())
      .then(setPosts);
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !selectedCustomer) return;
    const res = await fetch('/api/changeboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer,
        title: newPost.title,
        content: newPost.content,
      }),
    });
    if (res.ok) {
      setNewPost({ title: '', content: '' });
      loadPosts(selectedCustomer);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">📋 ChangeBoard</h1>

      <div>
        <h2 className="text-lg font-semibold">Kund:innen</h2>
        <ul className="space-y-2 mt-2">
          {customers.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => loadPosts(c.id)}
                className={`px-3 py-2 rounded ${selectedCustomer === c.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedCustomer && (
        <div className="space-y-4">
          <div className="p-4 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-2">➕ Neuer Beitrag</h2>
            <input
              className="w-full border px-3 py-2 mb-2 rounded"
              placeholder="Titel"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <div className="relative">
              <textarea
                className="w-full border px-3 py-2 mb-2 rounded"
                placeholder="Inhalt (Spracheingabe verfügbar)"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
              <button
                type="button"
                onClick={startListening}
                className="absolute right-2 top-2 text-sm text-blue-600 border border-blue-600 rounded px-2 py-1 hover:bg-blue-100"
              >
                🎤 Sprich
              </button>
            </div>
            <button
              onClick={handleCreatePost}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Beitrag speichern
            </button>
          </div>

          <h2 className="text-lg font-semibold">📌 Beiträge</h2>
          {posts.map((post) => (
            <div key={post.id} className="border rounded p-4 bg-white">
              <h3 className="font-bold text-gray-800">{post.title}</h3>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">{post.createdAt}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
