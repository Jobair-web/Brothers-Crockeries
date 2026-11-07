export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
export const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "01609663539";
export const PAGE_SIZE = 40;

export const STORE = {
  name: "Brothers Crockeries",
  legalName: "New Brothers Crockeries",
  tagline: "Quality Home | Happy Family",
  address: "C-66, Golam Rasul Market (3rd floor), Riyaz Uddin Bazar, Chattogram",
  phones: [
    { label: "Osman", number: "01830-857915" },
    { label: "Mizan", number: "01856-107704" },
    { label: "Zubair", number: "01898-415482" },
  ],
} as const;

export const SHIPPING_ZONES = {
  dhaka: { label: "Dhaka", cost: 80 },
  chattogram: { label: "Chattogram", cost: 70 },
  others: { label: "Others", cost: 150 },
} as const;

export const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur", "Chapainawabganj",
  "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur",
  "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokathi", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna",
  "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur",
  "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona",
  "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
] as const;
