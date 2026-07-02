import React from 'react';

const Testimonials = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#243989] mb-4">
            Témoignages
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ce que nos utilisateurs disent de nous
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#243989] to-[#3A52A8] rounded-2xl p-12 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-6">💬</div>
            <p className="text-2xl font-medium mb-8">
              Les témoignages de nos utilisateurs seront bientôt disponibles.
            </p>
            <p className="text-gray-200">
              Reviens bientôt pour découvrir les expériences des étudiants qui ont trouvé leur voie avec BideyaBoost.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
