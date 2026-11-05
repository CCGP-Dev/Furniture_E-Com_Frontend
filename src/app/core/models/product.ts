export interface Finish {
  name: string;
  color: string;
}

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
  seatHeight?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  material: string;
  image: string;
  isNew: boolean;
  inStock: boolean;

  description?: string;
  woodType?: string;
  images?: string[];
  finishes?: Finish[];
  dimensions?: Dimensions;
  care?: string;
}
