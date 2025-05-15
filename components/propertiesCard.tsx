import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface House {
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  imageSrc: string;
}

const houseData: House[] = [
  {
    imageSrc: "/house1.png",
    price: "$899,995",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2798,
    address: "5515 Melrose Ave. Valencia, CA 90038",
  },
  {
    imageSrc: "/house2.png",
    price: "$750,000",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2234,
    address: "1259 Willow St. Santa Clarita, CA 90035",
  },
  {
    imageSrc: "/house3.png",
    price: "$480,000",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1754,
    address: "30510 Tinker Blvd. #5, Los Angeles, CA 90011",
  },
];

function HouseCard({ house }: { house: House }) {
  return (
    <div className="w-full">
      <CardContent className="flex justify-between w-full p-2 space-y-3 border-b-2">
        <div className="flex gap-4">
          <Image
            src={house.imageSrc}
            alt="House Image"
            className="rounded-md aspect-video object-cover"
            width={100}
            height={50}
          />
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-900">{house.price}</p>
            <p className="text-gray-700 text-sm">
              {house.bedrooms} Bedroom • {house.bathrooms} Bath • {house.sqft}{" "}
              sq. ft.
            </p>
            <p className="text-gray-700 text-sm">{house.address}</p>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div className="relative group">
            <div className="w-2 h-2 bg-gray-300 rounded-full mb-1 group-hover:bg-gray-400"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full mb-1 group-hover:bg-gray-400"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-400"></div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

export function HouseCardList() {
  return (
    <Card className="w-full shadow-md rounded-md">
      <CardHeader className="pb-0 flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold">
          New Properties Find Today
        </CardTitle>
        <div className="flex flex-row space-x-2">
          <Button
            className="bg-primary pl-6 pr-6 hover:bg-primary/80 text-white"
            size="sm"
          >
            Find
          </Button>
          <Select defaultValue="Today">
            <SelectTrigger className="w-[100px] h-8 rounded-md text-sm">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Tomorrow">Tomorrow</SelectItem>
              <SelectItem value="Next Week">Next Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pl-4 pr-4 pt-4">
        <div className="flex flex-col space-y-2">
          {houseData.map((house, index) => (
            <HouseCard key={index} house={house} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
