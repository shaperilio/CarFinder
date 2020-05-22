const codes = [
    {
        code: 'DFV',
        description: '8-speed automatic (ZF 8HP75 - diesel only)'
    },
    {
        code: 'DFT',
        description: '8-speed automatic (ZF 850RE - gasoline only)'
    },
    {
        code: 'ERG',
        description: '3.6L V6 24V VVT eTorque'
    },
    {
        code: 'ERC',
        description: '3.6L V6 24V VVT ESS'
    },
    {
        code: 'EXJ',
        description: '3.0L V6 Turbo Diesel Engine ESS'
    },
    {
        code: 'EC3',
        description: '2.0L I4 DOHC DI Turbo eTorque'
    },
    {
        code: 'EC1',
        description: '2.0L I4 DOHC DI Turbo ESS'
    },
    // These are part of the "quick order" packages, which is how
    // trims are differentiated. E.g. Wrangler Sport has none of these.
    {
        code: 'HAA',
        description: 'Air conditioning'
    },
    {
        code: 'GCD',
        description: 'Deep tint sunscreen windows'
    },
    {
        code: 'GTB',
        description: 'Power heated mirrors'
    },
    {
        code: 'JPY',
        description: 'Power windows'
    },
    {
        code: 'GXM',
        description: 'Remote keyless entry'
    },

    // individual options
    {
        code: 'HT1',
        description: 'Black hard-top',
        dealerCost: 1166
    },
    {
        code: 'HT3',
        description: 'Body color hard-top',
        dealerCost: 1080 // depends on model
    },
    {
        code: 'CMD',
        description: 'Cargo group with trail rail system',
        dealerCost: 176
    },
    {
        code: 'ADE',
        description: 'Cold weather group (heated seats)',
        dealerCost: 896 //  626 with manual tranny
    },
    {
        code: 'AJ1',
        description: 'Safety group (ParkSense)', // maybe not needed with rear camera?
        dealerCost: 896
    },
    {
        code: 'AAN',
        description: 'Technology group (Apple CarPlay)',
        dealerCost: 896
    },   
    {
        code: 'AEK',
        description: 'Premium audio (Apple CarPlay)',
        dealerCost: 1661
    },
    {
        code: 'ALP',
        description: 'Advanced safety group (adaptive cruise control)',
        dealerCost: 716
    },

    // Interior fabric
    {
        code: 'A7',
        description: 'Cloth seats',
        dealerCost: 0
    },
    {
        code: 'X9',
        description: 'Black',
        dealerCost: 0
    },
    {
        code: 'T5',
        description: 'Black and tan',
        dealerCost: 0
    },
    // Colors
    {
        code: 'PRC',
        description: 'Firecracker red',
        dealerCost: 0
    },
    {
        code: 'PDN',
        description: 'Sting-gray',
        dealerCost: 0
    },
    {
        code: 'PBM',
        description: 'Ocean blue metallic',
        dealerCost: 221
    },
    {
        code: 'PYV',
        description: 'Hellayella',
        dealerCost: 0
    },
    {
        code: 'PGG',
        description: 'Sarge green',
        dealerCost: 0
    },
    // Individual codes for features I really want
    {
        code: 'RFP',
        description: 'Apple CarPlay',
    },
    {
        code: 'JPM',
        description: 'Heated front seats',
    },
    {
        code: 'XAA',
        description: 'Parksense rear',
    },
    {
        code: 'NH3', // code is NH1 with manual tranny because that one won't stop on its own.
        description: 'Adaptive cruise',
    },
    {
        code: 'GFA', // Part of 3 piece hard top
        description: 'Rear window defroster',
    },
];