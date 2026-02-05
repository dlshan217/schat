export default function Home({ user }) {
  return (
    <div className="home">
      <h2>Welcome</h2>
      <p>User ID: {user.uid}</p>

      <button>Stranger Chat (next phase)</button>
      <button>Inbox (next phase)</button>
    </div>
  );
}
