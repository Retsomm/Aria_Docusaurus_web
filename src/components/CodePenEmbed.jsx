import React from "react";

export default function CodePenEmbed({ slugHash, user }) {
  return (
    <p
      className="codepen"
      data-height="300"
      data-default-tab="html,result"
      data-slug-hash={slugHash}
      data-user={user}
      style={{ border: "2px solid #ccc", margin: "1em 0", padding: "1em" }}
    >
      <span>
        See the Pen{" "}
        <a href={`https://codepen.io/${user}/pen/${slugHash}`}>
          你的 CodePen 標題
        </a>{" "}
        by {user} on <a href="https://codepen.io/">CodePen</a>.
      </span>
      <script
        async
        src="https://cpwebassets.codepen.io/assets/embed/ei.js"
      ></script>
    </p>
  );
}
