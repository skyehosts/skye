import type { IListingAmenityCategoryDto } from '../dto-interfaces/listing/get-amenities-response.dto';
import { ListingAmenityId } from '../enums/listing-enums';

export const LISTING_AMENITY_CATEGORIES: IListingAmenityCategoryDto[] = [
  {
    id: 'essentials',
    title: 'Essentials',
    amenities: [
      { id: ListingAmenityId.Wifi, title: 'Wi-Fi', icon: 'wifi' },
      { id: ListingAmenityId.Towels, title: 'Towels', icon: 'towel-rail' },
      {
        id: ListingAmenityId.BedLinens,
        title: 'Bed linens / sheets',
        icon: 'bed',
      },
      {
        id: ListingAmenityId.PillowsBlankets,
        title: 'Pillows & blankets',
        icon: 'pillow',
      },
      { id: ListingAmenityId.Hangers, title: 'Hangers', icon: 'hanger' },
      { id: ListingAmenityId.Iron, title: 'Iron', icon: 'iron' },
      {
        id: ListingAmenityId.IroningBoard,
        title: 'Ironing board',
        icon: 'iron-board',
      },
      {
        id: ListingAmenityId.HairDryer,
        title: 'Hair dryer',
        icon: 'hair-dryer',
      },
      { id: ListingAmenityId.Shampoo, title: 'Shampoo', icon: 'bottle-tonic' },
      {
        id: ListingAmenityId.Conditioner,
        title: 'Conditioner',
        icon: 'bottle-tonic-outline',
      },
      {
        id: ListingAmenityId.BodyWash,
        title: 'Body wash / soap',
        icon: 'hand-wash',
      },
      {
        id: ListingAmenityId.ToiletPaper,
        title: 'Toilet paper',
        icon: 'paper-roll',
      },
      {
        id: ListingAmenityId.ExtraBedding,
        title: 'Extra bedding',
        icon: 'bed-outline',
      },
      {
        id: ListingAmenityId.BlackoutCurtains,
        title: 'Blackout curtains or blinds',
        icon: 'curtains',
      },
      {
        id: ListingAmenityId.HotWater,
        title: 'Hot water',
        icon: 'water-boiler',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety Features',
    amenities: [
      {
        id: ListingAmenityId.SmokeAlarm,
        title: 'Smoke alarm',
        icon: 'smoke-detector',
      },
      {
        id: ListingAmenityId.CarbonMonoxideAlarm,
        title: 'Carbon monoxide alarm',
        icon: 'molecule-co',
      },
      {
        id: ListingAmenityId.FireExtinguisher,
        title: 'Fire extinguisher',
        icon: 'fire-extinguisher',
      },
      {
        id: ListingAmenityId.FirstAidKit,
        title: 'First aid kit',
        icon: 'medical-bag',
      },
      {
        id: ListingAmenityId.EmergencyContactInfo,
        title: 'Emergency contact info',
        icon: 'phone-alert',
      },
      {
        id: ListingAmenityId.OutdoorLighting,
        title: 'Outdoor lighting',
        icon: 'outdoor-lamp',
      },
      {
        id: ListingAmenityId.SmartLock,
        title: 'Smart lock',
        icon: 'lock-smart',
      },
      {
        id: ListingAmenityId.KeylessEntry,
        title: 'Keyless entry',
        icon: 'key-wireless',
      },
    ],
  },
  {
    id: 'kitchen_dining',
    title: 'Kitchen & Dining',
    amenities: [
      {
        id: ListingAmenityId.Kitchen,
        title: 'Kitchen',
        icon: 'silverware-fork-knife',
      },
      {
        id: ListingAmenityId.Refrigerator,
        title: 'Refrigerator',
        icon: 'fridge',
      },
      {
        id: ListingAmenityId.Freezer,
        title: 'Freezer',
        icon: 'snowflake-thermometer',
      },
      { id: ListingAmenityId.Stove, title: 'Stove / hob', icon: 'stove' },
      { id: ListingAmenityId.Oven, title: 'Oven', icon: 'toaster-oven' },
      { id: ListingAmenityId.Microwave, title: 'Microwave', icon: 'microwave' },
      {
        id: ListingAmenityId.Dishwasher,
        title: 'Dishwasher',
        icon: 'dishwasher',
      },
      {
        id: ListingAmenityId.ElectricKettle,
        title: 'Electric kettle',
        icon: 'kettle',
      },
      { id: ListingAmenityId.KitchenSink, title: 'Sink', icon: 'sink' },
      {
        id: ListingAmenityId.PotsAndPans,
        title: 'Pots and pans',
        icon: 'pot-steam',
      },
      {
        id: ListingAmenityId.CookingUtensils,
        title: 'Cooking utensils',
        icon: 'silverware-spoon',
      },
      {
        id: ListingAmenityId.BakingTray,
        title: 'Baking tray',
        icon: 'tray-full',
      },
      {
        id: ListingAmenityId.CuttingBoards,
        title: 'Cutting boards',
        icon: 'content-cut',
      },
      { id: ListingAmenityId.Knives, title: 'Knives', icon: 'knife' },
      {
        id: ListingAmenityId.MeasuringCups,
        title: 'Measuring cups / spoons',
        icon: 'cup-water',
      },
      { id: ListingAmenityId.Plates, title: 'Plates', icon: 'circle-outline' },
      { id: ListingAmenityId.Bowls, title: 'Bowls', icon: 'bowl' },
      { id: ListingAmenityId.Mugs, title: 'Mugs', icon: 'coffee' },
      {
        id: ListingAmenityId.WineGlasses,
        title: 'Wine glasses',
        icon: 'glass-wine',
      },
      {
        id: ListingAmenityId.Cutlery,
        title: 'Cutlery',
        icon: 'silverware-variant',
      },
      {
        id: ListingAmenityId.ServingDishes,
        title: 'Serving dishes',
        icon: 'food-variant',
      },
      {
        id: ListingAmenityId.CoffeeMaker,
        title: 'Coffee maker or French press',
        icon: 'coffee-maker',
      },
      { id: ListingAmenityId.Toaster, title: 'Toaster', icon: 'toaster' },
      { id: ListingAmenityId.Blender, title: 'Blender', icon: 'blender' },
      {
        id: ListingAmenityId.CookingOil,
        title: 'Cooking oil',
        icon: 'bottle-wine',
      },
      {
        id: ListingAmenityId.SaltAndPepper,
        title: 'Salt & pepper',
        icon: 'shaker-outline',
      },
      { id: ListingAmenityId.TeaAndCoffee, title: 'Tea / coffee', icon: 'tea' },
      { id: ListingAmenityId.Sugar, title: 'Sugar', icon: 'cube-outline' },
    ],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    amenities: [
      {
        id: ListingAmenityId.DoubleKingBed,
        title: 'Double / king bed',
        icon: 'bed-king',
      },
      { id: ListingAmenityId.TwinBeds, title: 'Twin beds', icon: 'bunk-bed' },
      {
        id: ListingAmenityId.Wardrobe,
        title: 'Wardrobe or closet',
        icon: 'wardrobe',
      },
      {
        id: ListingAmenityId.Nightstands,
        title: 'Nightstands',
        icon: 'table-furniture',
      },
      {
        id: ListingAmenityId.BedsideLamps,
        title: 'Bedside lamps',
        icon: 'lamp',
      },
      {
        id: ListingAmenityId.ExtraPillows,
        title: 'Extra pillows',
        icon: 'pillow',
      },
      {
        id: ListingAmenityId.ExtraBlankets,
        title: 'Extra blankets',
        icon: 'bed-outline',
      },
      {
        id: ListingAmenityId.ElectricBlanket,
        title: 'Electric blanket',
        icon: 'flash',
      },
    ],
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    amenities: [
      { id: ListingAmenityId.Shower, title: 'Shower', icon: 'shower-head' },
      { id: ListingAmenityId.Bathtub, title: 'Bathtub', icon: 'bathtub' },
      {
        id: ListingAmenityId.HeatedTowelRail,
        title: 'Heated towel rail',
        icon: 'radiator',
      },
      {
        id: ListingAmenityId.Toiletries,
        title: 'Toiletries',
        icon: 'bottle-tonic-plus',
      },
      {
        id: ListingAmenityId.BathroomMirror,
        title: 'Mirror / makeup mirror',
        icon: 'mirror-rectangle',
      },
      {
        id: ListingAmenityId.BathroomVentilation,
        title: 'Bathroom ventilation',
        icon: 'fan',
      },
    ],
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    amenities: [
      { id: ListingAmenityId.TV, title: 'TV', icon: 'television' },
      {
        id: ListingAmenityId.SmartTV,
        title: 'Smart TV',
        icon: 'television-classic',
      },
      {
        id: ListingAmenityId.StreamingServices,
        title: 'Streaming services',
        icon: 'play-circle',
      },
      { id: ListingAmenityId.Books, title: 'Books', icon: 'book-open-variant' },
      { id: ListingAmenityId.BoardGames, title: 'Board games', icon: 'puzzle' },
      {
        id: ListingAmenityId.BluetoothSpeaker,
        title: 'Bluetooth speaker',
        icon: 'speaker-bluetooth',
      },
      {
        id: ListingAmenityId.PoolTable,
        title: 'Pool table',
        icon: 'billiards',
      },
      { id: ListingAmenityId.Piano, title: 'Piano', icon: 'piano' },
    ],
  },
  {
    id: 'heating_weather',
    title: 'Heating & Weather Comfort',
    amenities: [
      {
        id: ListingAmenityId.CentralHeating,
        title: 'Central heating',
        icon: 'radiator',
      },
      { id: ListingAmenityId.Radiators, title: 'Radiators', icon: 'radiator' },
      {
        id: ListingAmenityId.UnderfloorHeating,
        title: 'Underfloor heating',
        icon: 'heating-coil',
      },
      {
        id: ListingAmenityId.IndoorFireplace,
        title: 'Fireplace',
        icon: 'fireplace',
      },
      {
        id: ListingAmenityId.WoodBurningStove,
        title: 'Wood-burning stove',
        icon: 'fire',
      },
      { id: ListingAmenityId.PortableFan, title: 'Portable fan', icon: 'fan' },
      {
        id: ListingAmenityId.AirConditioning,
        title: 'Air conditioning',
        icon: 'snowflake',
      },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    amenities: [
      {
        id: ListingAmenityId.WashingMachine,
        title: 'Washing machine',
        icon: 'washing-machine',
      },
      { id: ListingAmenityId.Dryer, title: 'Dryer', icon: 'tumble-dryer' },
      { id: ListingAmenityId.DryingRack, title: 'Drying rack', icon: 'hanger' },
      {
        id: ListingAmenityId.LaundryDetergent,
        title: 'Laundry detergent',
        icon: 'bottle-tonic',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor',
    amenities: [
      { id: ListingAmenityId.Garden, title: 'Garden or yard', icon: 'flower' },
      { id: ListingAmenityId.Patio, title: 'Patio', icon: 'table-furniture' },
      {
        id: ListingAmenityId.DeckOrTerrace,
        title: 'Deck or terrace',
        icon: 'balcony',
      },
      {
        id: ListingAmenityId.OutdoorSeating,
        title: 'Outdoor seating',
        icon: 'seat',
      },
      {
        id: ListingAmenityId.OutdoorDiningArea,
        title: 'Outdoor dining area',
        icon: 'table-chair',
      },
      { id: ListingAmenityId.Firepit, title: 'Fire pit', icon: 'fire' },
      { id: ListingAmenityId.BBQGrill, title: 'BBQ grill', icon: 'grill' },
      {
        id: ListingAmenityId.PicnicArea,
        title: 'Picnic area',
        icon: 'table-picnic',
      },
      {
        id: ListingAmenityId.OutdoorGearStorage,
        title: 'Outdoor gear storage',
        icon: 'locker',
      },
      {
        id: ListingAmenityId.OutdoorShower,
        title: 'Outdoor shower',
        icon: 'shower',
      },
    ],
  },
  {
    id: 'parking_transport',
    title: 'Parking & Transport',
    amenities: [
      {
        id: ListingAmenityId.FreeParking,
        title: 'Free parking on premises',
        icon: 'parking',
      },
      {
        id: ListingAmenityId.PaidParking,
        title: 'Paid parking on premises',
        icon: 'credit-card-outline',
      },
      {
        id: ListingAmenityId.FreeStreetParking,
        title: 'Free street parking',
        icon: 'road-variant',
      },
      {
        id: ListingAmenityId.PrivateDriveway,
        title: 'Private driveway',
        icon: 'home-map-marker',
      },
      {
        id: ListingAmenityId.EvCharger,
        title: 'EV charger',
        icon: 'ev-station',
      },
      {
        id: ListingAmenityId.BicycleStorage,
        title: 'Bicycle storage',
        icon: 'bicycle',
      },
    ],
  },
  {
    id: 'family',
    title: 'Family',
    amenities: [
      { id: ListingAmenityId.HighChair, title: 'High chair', icon: 'seat' },
      { id: ListingAmenityId.Crib, title: 'Crib / travel cot', icon: 'cradle' },
      {
        id: ListingAmenityId.ChildrensBooks,
        title: "Children's books",
        icon: 'book-child',
      },
      { id: ListingAmenityId.Toys, title: 'Toys', icon: 'teddy-bear' },
      {
        id: ListingAmenityId.BabyBath,
        title: 'Baby bath',
        icon: 'baby-face-outline',
      },
    ],
  },
  {
    id: 'work_remote',
    title: 'Work & Remote Work',
    amenities: [
      {
        id: ListingAmenityId.DedicatedWorkspace,
        title: 'Dedicated workspace',
        icon: 'desk',
      },
      { id: ListingAmenityId.Desk, title: 'Desk', icon: 'desk-lamp' },
      {
        id: ListingAmenityId.OfficeChair,
        title: 'Office chair',
        icon: 'chair-rolling',
      },
      {
        id: ListingAmenityId.FastWifi,
        title: 'Fast Wi-Fi',
        icon: 'wifi-strength-4',
      },
      {
        id: ListingAmenityId.EthernetConnection,
        title: 'Ethernet connection',
        icon: 'ethernet',
      },
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    amenities: [
      {
        id: ListingAmenityId.StepFreeEntrance,
        title: 'Step-free entrance',
        icon: 'stairs',
      },
      {
        id: ListingAmenityId.WideDoorway,
        title: 'Wide doorway',
        icon: 'door-open',
      },
      {
        id: ListingAmenityId.GroundFloorBedroom,
        title: 'Ground-floor bedroom',
        icon: 'bed',
      },
      {
        id: ListingAmenityId.GrabBars,
        title: 'Grab bars in bathroom',
        icon: 'hand-front-right',
      },
      {
        id: ListingAmenityId.WalkInShower,
        title: 'Walk-in shower',
        icon: 'shower',
      },
    ],
  },
  {
    id: 'luxury',
    title: 'Luxury',
    amenities: [
      { id: ListingAmenityId.HotTub, title: 'Hot tub', icon: 'hot-tub' },
      { id: ListingAmenityId.Pool, title: 'Pool', icon: 'pool' },
      { id: ListingAmenityId.Sauna, title: 'Sauna', icon: 'heat-wave' },
      {
        id: ListingAmenityId.WoodFiredHotTub,
        title: 'Wood-fired hot tub',
        icon: 'hot-tub',
      },
      {
        id: ListingAmenityId.OutdoorHotTubWithView,
        title: 'Outdoor hot tub with view',
        icon: 'hot-tub',
      },
      {
        id: ListingAmenityId.ExerciseEquipment,
        title: 'Exercise equipment',
        icon: 'dumbbell',
      },
    ],
  },
  {
    id: 'experience_nature',
    title: 'Experience & Nature',
    amenities: [
      { id: ListingAmenityId.Telescope, title: 'Telescope', icon: 'telescope' },
      {
        id: ListingAmenityId.HikingMaps,
        title: 'Hiking maps',
        icon: 'map-outline',
      },
      {
        id: ListingAmenityId.BootDryingRack,
        title: 'Boot drying rack',
        icon: 'shoe-formal',
      },
      {
        id: ListingAmenityId.Binoculars,
        title: 'Binoculars',
        icon: 'binoculars',
      },
      { id: ListingAmenityId.Kayaks, title: 'Kayaks', icon: 'kayaking' },
      { id: ListingAmenityId.LakeAccess, title: 'Lake access', icon: 'waves' },
      {
        id: ListingAmenityId.BeachAccess,
        title: 'Beach access',
        icon: 'beach',
      },
      { id: ListingAmenityId.SkiInOut, title: 'Ski-in/out', icon: 'ski' },
    ],
  },
  {
    id: 'pet_friendly',
    title: 'Pet-Friendly',
    amenities: [
      { id: ListingAmenityId.PetsAllowed, title: 'Pets allowed', icon: 'paw' },
      { id: ListingAmenityId.DogBed, title: 'Dog bed', icon: 'dog' },
      {
        id: ListingAmenityId.PetBowls,
        title: 'Pet bowls',
        icon: 'food-drumstick',
      },
      {
        id: ListingAmenityId.FencedGarden,
        title: 'Fenced garden',
        icon: 'fence',
      },
      {
        id: ListingAmenityId.DogTowels,
        title: 'Dog towels / cleaning station',
        icon: 'dog-side',
      },
    ],
  },
  {
    id: 'guest_convenience',
    title: 'Guest Convenience',
    amenities: [
      {
        id: ListingAmenityId.SelfCheckIn,
        title: 'Self check-in',
        icon: 'door',
      },
      { id: ListingAmenityId.Lockbox, title: 'Lockbox', icon: 'lock' },
      {
        id: ListingAmenityId.LuggageDropOff,
        title: 'Luggage drop-off allowed',
        icon: 'bag-suitcase',
      },
      {
        id: ListingAmenityId.LongTermStays,
        title: 'Long-term stays allowed',
        icon: 'calendar-month',
      },
      {
        id: ListingAmenityId.LocalGuidebook,
        title: 'Local guidebook',
        icon: 'book-open-page-variant',
      },
    ],
  },
  {
    id: 'scenic_features',
    title: 'Scenic Features',
    amenities: [
      { id: ListingAmenityId.SeaView, title: 'Sea view', icon: 'waves' },
      {
        id: ListingAmenityId.LochView,
        title: 'Loch view',
        icon: 'image-filter-hdr',
      },
      {
        id: ListingAmenityId.MountainView,
        title: 'Mountain view',
        icon: 'mountain',
      },
      {
        id: ListingAmenityId.CountrysideView,
        title: 'Countryside view',
        icon: 'grass',
      },
      {
        id: ListingAmenityId.WaterfrontAccess,
        title: 'Waterfront access',
        icon: 'pier',
      },
      { id: ListingAmenityId.GardenView, title: 'Garden view', icon: 'flower' },
    ],
  },
];

/** Flat lookup map: amenity ID → { title, icon } */
export const LISTING_AMENITY_MAP: Record<
  string,
  { title: string; icon: string }
> = Object.fromEntries(
  LISTING_AMENITY_CATEGORIES.flatMap((cat) =>
    cat.amenities.map((a) => [a.id, { title: a.title, icon: a.icon }]),
  ),
) as Record<string, { title: string; icon: string }>;
