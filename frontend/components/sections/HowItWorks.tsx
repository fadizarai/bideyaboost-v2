import React from 'react';
import Link from 'next/link';
import { V2 } from '../../lib/routes';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Renseigne tes notes',
      description: 'Entre tes notes du baccalauréat et tes matières principales',
      href: V2.calculator,
    },
    {
      number: '02',
      title: 'Calcule ton score',
      description: 'Notre algorithme analyse ton profil académique',
      href: V2.calculeScore,
    },
    {
      number: '03',
      title: 'Réalise le test psychométrique',
      description: 'Découvre ta personnalité et tes préférences',
      href: V2.psychometric,
    },
    {
      number: '04',
      title: 'Reçois tes 10 meilleures orientations',
      description: "L'IA te recommande les filières qui te correspondent le mieux",
      href: V2.choices,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#243989] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un processus simple en 4 étapes pour trouver ta voie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Link href={step.href} className="block h-full group">
                <div className="bg-gradient-to-br from-[#243989] to-[#3A52A8] rounded-2xl p-6 text-white h-full transition-transform group-hover:scale-[1.02] group-hover:shadow-xl">
                  <div className="text-5xl font-bold mb-4 opacity-30">{step.number}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-200">{step.description}</p>
                </div>
              </Link>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-[#B5E846]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
