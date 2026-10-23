// ?only=N keeps a single screen, for exporting one frame as a PNG.
const only = new URLSearchParams(location.search).get("only");
if (only !== null) {
  document.body.classList.add("shot");
  document.querySelector(".deck-head")?.remove();
  document.querySelectorAll(".screen").forEach((s, i) => String(i) === only || s.remove());
}
