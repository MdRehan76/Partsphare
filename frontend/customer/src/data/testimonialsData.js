/**
 * PartNexa Customer Testimonials Data
 * 
 * NOTE ON CUSTOMER FEEDBACK DATA:
 * Real customer review endpoints/tables are not yet configured in the database.
 * Per project specifications, the entries below are clearly marked as configurable
 * demo/reference data (`isDemo: true`, `verified: false`) to avoid presenting simulated
 * content as genuine customer reviews.
 * 
 * These records represent realistic vehicle-owner workflows (compatibility discovery,
 * doorstep DIFM installation, express delivery, and verified used parts) and can be
 * seamlessly replaced with live backend reviews via API or database hooks.
 */

export const INITIAL_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Vikramaditya S.',
    role: 'Car Owner',
    vehicle: 'Honda City 5th Gen (2020)',
    rating: 5,
    title: 'Flawless fitment for front brake discs & pads',
    review:
      'Finding the exact OEM-compatible brake rotors for my 5th gen City was a nightmare at local shops. PartNexa vehicle filter matched the exact variant. Delivered in 24 hours in secure sealed packaging.',
    serviceType: 'Verified Parts Discovery',
    location: 'Bengaluru, KA',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    avatarInitials: 'VS',
  },
  {
    id: 't-2',
    name: 'Priya Nambiar',
    role: 'Daily Commuter',
    vehicle: 'Hyundai Creta 1.5L Diesel (2021)',
    rating: 5,
    title: 'Doorstep battery replacement with DIFM mechanic',
    review:
      'My SUV battery died right before a road trip. Ordered an Amaron battery with the "Home Installation" option. The certified mechanic arrived at 11 AM with testing equipment and fitted it in 30 minutes.',
    serviceType: 'DIFM Home Installation',
    location: 'Pune, MH',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    avatarInitials: 'PN',
  },
  {
    id: 't-3',
    name: 'Arjun Mehta',
    role: 'Bike Enthusiast',
    vehicle: 'Royal Enfield Classic 350 (2019)',
    rating: 5,
    title: 'Genuine clutch cable and carburetor assembly',
    review:
      'Most online marketplaces send counterfeit two-wheeler spares. PartNexa provided genuine OEM sealed parts with batch verification. Saved around 25% compared to authorized dealership markup.',
    serviceType: 'Genuine OEM Sourcing',
    location: 'Hyderabad, TS',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
    avatarInitials: 'AM',
  },
  {
    id: 't-4',
    name: 'Rohan Deshmukh',
    role: 'DIY Auto Enthusiast',
    vehicle: 'Maruti Suzuki Swift VXi (2018)',
    rating: 5,
    title: 'Verified used ORVM mirror assembly at 60% savings',
    review:
      'Replacing an electric side mirror was quoted ₹6,500 new. Bought a certified used-verified assembly on PartNexa for ₹2,400. Mirror motors and turn indicator glass were inspected and work like brand new.',
    serviceType: 'Circular Used-Part Marketplace',
    location: 'Mumbai, MH',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    avatarInitials: 'RD',
  },
  {
    id: 't-5',
    name: 'Sneha Kulkarni',
    role: 'Fleet Manager',
    vehicle: 'Tata Nexon EV & Punch Fleet',
    rating: 5,
    title: 'Consistent delivery and transparent pricing for fleets',
    review:
      'We manage 12 intra-city delivery cars. Sourcing wiper blades, cabin filters, and suspension bushings on PartNexa with automated invoice generation has cut vehicle maintenance downtime in half.',
    serviceType: 'Commercial Fleet Support',
    location: 'Gurugram, HR',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
    avatarInitials: 'SK',
  },
  {
    id: 't-6',
    name: 'Farhan Akhtar',
    role: 'Independent Mechanic',
    vehicle: 'Mahindra Scorpio-N (2022)',
    rating: 5,
    title: 'Right parts delivered directly to workshop bay',
    review:
      'When customer cars are on hydraulic lifts, waiting days for parts hurts business. Last-mile riders delivered the genuine suspension link rods within 3 hours. Great partner network.',
    serviceType: 'Workshop Partner Delivery',
    location: 'Delhi NCR',
    verified: false,
    isDemo: true,
    avatarColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    avatarInitials: 'FA',
  },
];

/**
 * Service hook to fetch customer testimonials.
 * Can be hooked up to an API endpoint when reviews table is populated.
 */
export const getCustomerTestimonials = async () => {
  // In the future, this can invoke: const res = await api.get('/reviews/featured');
  return INITIAL_TESTIMONIALS;
};

export default INITIAL_TESTIMONIALS;
