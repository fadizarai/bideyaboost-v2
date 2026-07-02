import React from 'react';
import { Card, CardContent } from '../ui/Card';

const WhyBideyaBoost = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Orientation intelligente',
      description: 'Basée sur l\'IA pour des recommandations personnalisées',
    },
    {
      icon: '🤖',
      title: 'Technologie avancée',
      description: 'Algorithmes sophistiqués pour analyser ton profil',
    },
    {
      icon: '🇹🇳',
      title: 'Adapté au système tunisien',
      description: 'Conçu spécifiquement pour les étudiants tunisiens',
    },
    {
      icon: '📊',
      title: 'Recommandations personnalisées',
      description: 'Chaque profil est unique, tes recommandations aussi',
    },
    {
      icon: '🧠',
      title: 'Analyse de personnalité',
      description: 'Comprend tes traits de caractère pour mieux t\'orienter',
    },
    {
      icon: '⏰',
      title: 'Gain de temps',
      description: 'Économise des heures de recherche et d\'hésitation',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#243989] mb-4">
            Pourquoi BideyaBoost ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme d'orientation la plus complète pour les étudiants tunisiens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} variant="default" hover>
              <CardContent>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#243989] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBideyaBoost;
