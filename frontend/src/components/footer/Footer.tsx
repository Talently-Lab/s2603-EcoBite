interface FooterSection {
  title: string;
  links: string[]; 
}

export default function Footer() {
  const footerSections: FooterSection[] = [
    { title: 'EcoBite', links: ['Sobre nosotros', 'Impacto'] },
    { title: 'Explorar', links: ['Restaurantes', 'Cómo funciona'] },
    { title: 'Ayuda', links: ['Contacto', 'Términos'] },
    { title: 'Redes', links: ['Instagram', 'LinkedIn'] }
  ];

  return (
    <footer className="bg-eco-dark px-6 py-12 md:px-12 md:py-16 w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:text-left">
        {footerSections.map((section, index) => (
          <div key={index} className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-base md:text-lg">{section.title}</h3>
            
            
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              {section.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex items-center gap-x-2">
                  <a href="#" className="hover:text-white transition-colors duration-200 text-eco-light">
                    {link}
                  </a>
                  {/* Agrega el punto flotante intermedio solo si NO es el último elemento */}
                  {linkIndex < section.links.length - 1 && (
                    <span className="text-eco-light/50 select-none">·</span>
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
      
      {/* Barra inferior de Copyright */}
      <div className="max-w-6xl mx-auto mt-12 pt-6 font-bold text-xs border-t text-eco-light sm:text-left">
        <p>&copy; 2026 EcoBite · Prototipo de alta fidelidad (S2)</p>
      </div>
    </footer>
  );
}