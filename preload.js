// Quand le contenu est chargé
window.addEventListener('DOMContentLoaded', () => {
  // Fonction qui permet d'injecter du texte
  const replaceText = (selector, text) => {
    const el = document.getElementById(selector)
    if(el) {
      el.innerHTML = text
    }
  }

  // Boucle sur les types d'outils + appel fonction replaceText
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  
})
