<template>
  <footer>
    <div class="footer-logo">La <span>Brasa</span></div>
    <p class="footer-copy">© 2026 La Brasa Restaurante · Granada</p>
  </footer>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap");

footer {
  background: var(--dark, #1a1410);
  padding: 2.5rem 5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  color: var(--cream, #f5f0e8);
  font-weight: 400;
}
.footer-logo span {
  color: var(--gold, #c9963a);
  font-style: italic;
}
.footer-copy {
  font-family: "Montserrat", sans-serif;
  font-size: 0.68rem;
  color: rgba(245, 240, 232, 0.35);
  letter-spacing: 0.08em;
}
</style>
