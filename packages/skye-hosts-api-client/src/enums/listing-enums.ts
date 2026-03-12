export enum ListingTypeId {
  House = 'house',
  FlatApartment = 'flat_apartment',
  Barn = 'barn',
  BedAndBreakfast = 'bed_and_breakfast',
  Cabin = 'cabin',
  CampervanMotorhome = 'campervan_motorhome',
  Farm = 'farm',
  GuestHouse = 'guest_house',
  Hotel = 'hotel',
  Houseboat = 'houseboat',
  ShepherdsHut = 'shepherds_hut',
  Tent = 'tent',
  TinyHome = 'tiny_home',
  TreeHouse = 'tree_house',
  Yurt = 'yurt',
}

export enum ListingSafetyDisclosureId {
  ExteriorSecurityCamera = 'exterior_security_camera',
  NoiseDecibelMonitor = 'noise_decibel_monitor',
  WeaponsOnProperty = 'weapons_on_property',
}

export const LISTING_SAFETY_DISCLOSURE_LABELS: Record<
  ListingSafetyDisclosureId,
  string
> = {
  [ListingSafetyDisclosureId.ExteriorSecurityCamera]:
    'Exterior security camera present',
  [ListingSafetyDisclosureId.NoiseDecibelMonitor]:
    'Noise decibel monitor present',
  [ListingSafetyDisclosureId.WeaponsOnProperty]: 'Weapon(s) on the property',
};

export enum ListingBookingType {
  ApproveFirst = 'approve_first',
  InstantBook = 'instant_book',
}

export const LISTING_BOOKING_TYPE_OPTIONS: {
  id: ListingBookingType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: ListingBookingType.ApproveFirst,
    title: 'Approve your first 5 bookings',
    description:
      'Start by reviewing reservation requests, then switch to instant book so guests can book automatically.',
    icon: 'calendar-outline',
  },
  {
    id: ListingBookingType.InstantBook,
    title: 'Use instant book',
    description: 'Let guests book automatically.',
    icon: 'lightning-bolt',
  },
];

export enum ListingHighlightId {
  Peaceful = 'peaceful',
  Unique = 'unique',
  FamilyFriendly = 'family_friendly',
  Stylish = 'stylish',
  Central = 'central',
  Spacious = 'spacious',
}

export const LISTING_HIGHLIGHT_LABELS: Record<ListingHighlightId, string> = {
  [ListingHighlightId.Peaceful]: 'Peaceful',
  [ListingHighlightId.Unique]: 'Unique',
  [ListingHighlightId.FamilyFriendly]: 'Family-friendly',
  [ListingHighlightId.Stylish]: 'Stylish',
  [ListingHighlightId.Central]: 'Central',
  [ListingHighlightId.Spacious]: 'Spacious',
};

export enum ListingAmenityId {
  // Essentials
  Wifi = 'wifi',
  Towels = 'towels',
  BedLinens = 'bed_linens',
  PillowsBlankets = 'pillows_blankets',
  Hangers = 'hangers',
  Iron = 'iron',
  IroningBoard = 'ironing_board',
  HairDryer = 'hair_dryer',
  Shampoo = 'shampoo',
  Conditioner = 'conditioner',
  BodyWash = 'body_wash',
  ToiletPaper = 'toilet_paper',
  ExtraBedding = 'extra_bedding',
  BlackoutCurtains = 'blackout_curtains',
  HotWater = 'hot_water',

  // Safety
  SmokeAlarm = 'smoke_alarm',
  CarbonMonoxideAlarm = 'carbon_monoxide_alarm',
  FireExtinguisher = 'fire_extinguisher',
  FirstAidKit = 'first_aid_kit',
  EmergencyContactInfo = 'emergency_contact_info',
  OutdoorLighting = 'outdoor_lighting',
  SmartLock = 'smart_lock',
  KeylessEntry = 'keyless_entry',

  // Kitchen & Dining
  Kitchen = 'kitchen',
  Refrigerator = 'refrigerator',
  Freezer = 'freezer',
  Stove = 'stove',
  Oven = 'oven',
  Microwave = 'microwave',
  Dishwasher = 'dishwasher',
  ElectricKettle = 'electric_kettle',
  KitchenSink = 'kitchen_sink',
  PotsAndPans = 'pots_and_pans',
  CookingUtensils = 'cooking_utensils',
  BakingTray = 'baking_tray',
  CuttingBoards = 'cutting_boards',
  Knives = 'knives',
  MeasuringCups = 'measuring_cups',
  Plates = 'plates',
  Bowls = 'bowls',
  Mugs = 'mugs',
  WineGlasses = 'wine_glasses',
  Cutlery = 'cutlery',
  ServingDishes = 'serving_dishes',
  CoffeeMaker = 'coffee_maker',
  Toaster = 'toaster',
  Blender = 'blender',
  CookingOil = 'cooking_oil',
  SaltAndPepper = 'salt_and_pepper',
  TeaAndCoffee = 'tea_and_coffee',
  Sugar = 'sugar',

  // Bedroom
  DoubleKingBed = 'double_king_bed',
  TwinBeds = 'twin_beds',
  Wardrobe = 'wardrobe',
  Nightstands = 'nightstands',
  BedsideLamps = 'bedside_lamps',
  ExtraPillows = 'extra_pillows',
  ExtraBlankets = 'extra_blankets',
  ElectricBlanket = 'electric_blanket',

  // Bathroom
  Shower = 'shower',
  Bathtub = 'bathtub',
  HeatedTowelRail = 'heated_towel_rail',
  Toiletries = 'toiletries',
  BathroomMirror = 'bathroom_mirror',
  BathroomVentilation = 'bathroom_ventilation',

  // Entertainment
  TV = 'tv',
  SmartTV = 'smart_tv',
  StreamingServices = 'streaming_services',
  Books = 'books',
  BoardGames = 'board_games',
  BluetoothSpeaker = 'bluetooth_speaker',
  PoolTable = 'pool_table',
  Piano = 'piano',

  // Heating & Weather
  CentralHeating = 'central_heating',
  Radiators = 'radiators',
  UnderfloorHeating = 'underfloor_heating',
  IndoorFireplace = 'indoor_fireplace',
  WoodBurningStove = 'wood_burning_stove',
  PortableFan = 'portable_fan',
  AirConditioning = 'air_conditioning',

  // Laundry
  WashingMachine = 'washing_machine',
  Dryer = 'dryer',
  DryingRack = 'drying_rack',
  LaundryDetergent = 'laundry_detergent',

  // Outdoor
  Garden = 'garden',
  Patio = 'patio',
  DeckOrTerrace = 'deck_or_terrace',
  OutdoorSeating = 'outdoor_seating',
  OutdoorDiningArea = 'outdoor_dining_area',
  Firepit = 'firepit',
  BBQGrill = 'bbq_grill',
  PicnicArea = 'picnic_area',
  OutdoorGearStorage = 'outdoor_gear_storage',
  OutdoorShower = 'outdoor_shower',

  // Parking & Transport
  FreeParking = 'free_parking',
  PaidParking = 'paid_parking',
  FreeStreetParking = 'free_street_parking',
  PrivateDriveway = 'private_driveway',
  EvCharger = 'ev_charger',
  BicycleStorage = 'bicycle_storage',

  // Family
  HighChair = 'high_chair',
  Crib = 'crib',
  ChildrensBooks = 'childrens_books',
  Toys = 'toys',
  BabyBath = 'baby_bath',

  // Work & Remote Work
  DedicatedWorkspace = 'dedicated_workspace',
  Desk = 'desk',
  OfficeChair = 'office_chair',
  FastWifi = 'fast_wifi',
  EthernetConnection = 'ethernet_connection',

  // Accessibility
  StepFreeEntrance = 'step_free_entrance',
  WideDoorway = 'wide_doorway',
  GroundFloorBedroom = 'ground_floor_bedroom',
  GrabBars = 'grab_bars',
  WalkInShower = 'walk_in_shower',

  // Luxury
  Pool = 'pool',
  HotTub = 'hot_tub',
  Sauna = 'sauna',
  WoodFiredHotTub = 'wood_fired_hot_tub',
  OutdoorHotTubWithView = 'outdoor_hot_tub_with_view',
  ExerciseEquipment = 'exercise_equipment',

  // Experience & Nature
  Telescope = 'telescope',
  HikingMaps = 'hiking_maps',
  BootDryingRack = 'boot_drying_rack',
  Binoculars = 'binoculars',
  Kayaks = 'kayaks',
  LakeAccess = 'lake_access',
  BeachAccess = 'beach_access',
  SkiInOut = 'ski_in_out',

  // Pet-Friendly
  PetsAllowed = 'pets_allowed',
  DogBed = 'dog_bed',
  PetBowls = 'pet_bowls',
  FencedGarden = 'fenced_garden',
  DogTowels = 'dog_towels',

  // Guest Convenience
  SelfCheckIn = 'self_check_in',
  Lockbox = 'lockbox',
  LuggageDropOff = 'luggage_drop_off',
  LongTermStays = 'long_term_stays',
  LocalGuidebook = 'local_guidebook',

  // Scenic Features
  SeaView = 'sea_view',
  LochView = 'loch_view',
  MountainView = 'mountain_view',
  CountrysideView = 'countryside_view',
  WaterfrontAccess = 'waterfront_access',
  GardenView = 'garden_view',
}

export enum ListingSpaceType {
  EntirePlace = 'entire_place',
  Room = 'room',
  SharedRoom = 'shared_room',
}

export const LISTING_TYPE_IDS: ListingTypeId[] = Object.values(ListingTypeId);

export const LISTING_SPACE_TYPES: ListingSpaceType[] =
  Object.values(ListingSpaceType);

export type ListingStatus = 'active' | 'inactive' | 'draft';

export const LISTING_STATUSES: ListingStatus[] = [
  'active',
  'inactive',
  'draft',
];

export enum PropertySizeUnit {
  SquareMetres = 'square_metres',
  SquareFeet = 'square_feet',
}

export const PROPERTY_SIZE_UNITS: PropertySizeUnit[] =
  Object.values(PropertySizeUnit);

export const PROPERTY_SIZE_UNIT_LABELS: Record<PropertySizeUnit, string> = {
  [PropertySizeUnit.SquareMetres]: 'Square metres',
  [PropertySizeUnit.SquareFeet]: 'Square feet',
};

export const LISTING_TYPE_LABELS: Record<ListingTypeId, string> = {
  [ListingTypeId.House]: 'House',
  [ListingTypeId.FlatApartment]: 'Flat / Apartment',
  [ListingTypeId.Barn]: 'Barn',
  [ListingTypeId.BedAndBreakfast]: 'Bed & Breakfast',
  [ListingTypeId.Cabin]: 'Cabin',
  [ListingTypeId.CampervanMotorhome]: 'Campervan / Motorhome',
  [ListingTypeId.Farm]: 'Farm',
  [ListingTypeId.GuestHouse]: 'Guest house',
  [ListingTypeId.Hotel]: 'Hotel',
  [ListingTypeId.Houseboat]: 'Houseboat',
  [ListingTypeId.ShepherdsHut]: "Shepherd's hut",
  [ListingTypeId.Tent]: 'Tent',
  [ListingTypeId.TinyHome]: 'Tiny home',
  [ListingTypeId.TreeHouse]: 'Tree house',
  [ListingTypeId.Yurt]: 'Yurt',
};

export const LISTING_SPACE_TYPE_LABELS: Record<ListingSpaceType, string> = {
  [ListingSpaceType.EntirePlace]: 'Entire place',
  [ListingSpaceType.Room]: 'Room',
  [ListingSpaceType.SharedRoom]: 'Shared room',
};

export enum HostInteractionId {
  NotAvailable = 'not_available',
  UrgentOnly = 'urgent_only',
  HappyToSocialise = 'happy_to_socialise',
  Flexible = 'flexible',
}

export const HOST_INTERACTION_OPTIONS: {
  id: HostInteractionId;
  label: string;
}[] = [
  {
    id: HostInteractionId.NotAvailable,
    label: "I won't be available in person, but you can reach me via the app",
  },
  {
    id: HostInteractionId.UrgentOnly,
    label:
      'I will be available for your urgent needs but otherwise keep to myself',
  },
  {
    id: HostInteractionId.HappyToSocialise,
    label:
      "I'm happy to socialise and have a chat, and ask any questions you may have",
  },
  {
    id: HostInteractionId.Flexible,
    label: "I'm not fussed, will adjust to your preferences",
  },
];

export enum CheckoutInstructionId {
  Towels = 'towels',
  Rubbish = 'rubbish',
  TurnThingsOff = 'turn_things_off',
  LockUp = 'lock_up',
  ReturnKeys = 'return_keys',
  Additions = 'additions',
}

export const CHECKOUT_INSTRUCTION_OPTIONS: {
  id: CheckoutInstructionId;
  title: string;
  defaultText: string;
  icon: string;
  field: string;
}[] = [
  {
    id: CheckoutInstructionId.Towels,
    title: 'Gather used towels',
    defaultText: 'Please put used towels in the shower tray',
    icon: 'water-outline',
    field: 'checkoutInstructionTowels',
  },
  {
    id: CheckoutInstructionId.Rubbish,
    title: 'Throw rubbish away',
    defaultText: 'Please bag up any rubbish and place it in the bins outside',
    icon: 'trash-outline',
    field: 'checkoutInstructionRubbish',
  },
  {
    id: CheckoutInstructionId.TurnThingsOff,
    title: 'Turn things off',
    defaultText:
      'Please turn off all lights, heating and appliances before you leave',
    icon: 'power-outline',
    field: 'checkoutInstructionTurnThingsOff',
  },
  {
    id: CheckoutInstructionId.LockUp,
    title: 'Lock up',
    defaultText:
      'Please ensure all doors and windows are locked when you leave',
    icon: 'lock-closed-outline',
    field: 'checkoutInstructionLockUp',
  },
  {
    id: CheckoutInstructionId.ReturnKeys,
    title: 'Return keys',
    defaultText: 'Please return all keys to the lockbox',
    icon: 'key-outline',
    field: 'checkoutInstructionReturnKeys',
  },
  {
    id: CheckoutInstructionId.Additions,
    title: 'Additional requests',
    defaultText: '',
    icon: 'add-circle-outline',
    field: 'checkoutInstructionAdditions',
  },
];

export type HouseRuleDataType = 'boolean' | 'doubleTime' | 'string';

export interface IHouseRuleConfig {
  id: string;
  title: string;
  description?: string;
  type: HouseRuleDataType;
  icon: string;
  field: string;
  enabledField?: string;
  startField?: string;
  endField?: string;
}

export const HOUSE_RULES_CONFIG: IHouseRuleConfig[] = [
  {
    id: 'pets',
    title: 'Pets allowed',
    description:
      'You can refuse pets, but must reasonably accommodate service animals.',
    type: 'boolean',
    icon: 'paw-outline',
    field: 'houseRulePetsAllowed',
  },
  {
    id: 'events',
    title: 'Events allowed',
    type: 'boolean',
    icon: 'calendar-outline',
    field: 'houseRuleEventsAllowed',
  },
  {
    id: 'smoking',
    title: 'Smoking allowed',
    type: 'boolean',
    icon: 'ban-outline',
    field: 'houseRuleSmokingAllowed',
  },
  {
    id: 'vaping',
    title: 'Vaping / e-cigarettes allowed',
    type: 'boolean',
    icon: 'cloud-outline',
    field: 'houseRuleVapingAllowed',
  },
  {
    id: 'quietHours',
    title: 'Quiet hours',
    type: 'doubleTime',
    icon: 'moon-outline',
    field: 'houseRuleQuietHoursEnabled',
    enabledField: 'houseRuleQuietHoursEnabled',
    startField: 'houseRuleQuietHoursStart',
    endField: 'houseRuleQuietHoursEnd',
  },
  {
    id: 'otherRules',
    title: 'Other rules',
    description: 'Share anything else you expect from guests',
    type: 'string',
    icon: 'document-text-outline',
    field: 'houseRuleOtherRules',
  },
];
