export type Category = {
  id: number;
  parent_id: number | null;
  name: string;
  children?: Category[];
};

export const categories: Category[] = [
  {
    id: 1,
    parent_id: null,
    name: '의류',
    children: [
      {
        id: 10,
        parent_id: 1,
        name: '상의',
        children: [
          { id: 103, parent_id: 10, name: '스웨터' },
          { id: 104, parent_id: 10, name: '가디건' },
        ],
      },
      {
        id: 11,
        parent_id: 1,
        name: '하의',
        children: [
          { id: 201, parent_id: 11, name: '바지' },
          { id: 202, parent_id: 11, name: '스커트' },
        ],
      },
    ],
  },
  {
    id: 2,
    parent_id: null,
    name: '소품류',
    children: [
      {
        id: 20,
        parent_id: 2,
        name: '모자류',
        children: [
          { id: 301, parent_id: 20, name: '비니' },
          { id: 302, parent_id: 20, name: '바라클라바' },
        ],
      },
      {
        id: 21,
        parent_id: 2,
        name: '가방류',
        children: [
          { id: 311, parent_id: 21, name: '숄더백' },
          { id: 312, parent_id: 21, name: '크로스백' },
          { id: 313, parent_id: 21, name: '파우치' },
        ],
      },
      {
        id: 22,
        parent_id: 2,
        name: '손/발 ACC',
        children: [
          { id: 321, parent_id: 22, name: '장갑' },
          { id: 322, parent_id: 22, name: '양말' },
        ],
      },
      {
        id: 23,
        parent_id: 2,
        name: '목/몸 ACC',
        children: [
          { id: 331, parent_id: 23, name: '목도리' },
          { id: 332, parent_id: 23, name: '숄' },
        ],
      },
      {
        id: 24,
        parent_id: 2,
        name: '기타',
        children: [
          { id: 341, parent_id: 24, name: '인형' },
        ],
      },
    ],
  },
];

export const flattenedCategories = (): Category[] => {
  const flattened: Category[] = [];

  const flatten = (cats: Category[]) => {
    for (const cat of cats) {
      flattened.push(cat);
      if (cat.children) {
        flatten(cat.children);
      }
    }
  };

  flatten(categories);
  return flattened;
};

export const getCategoryById = (id: number): Category | undefined => {
  return flattenedCategories().find(c => c.id === id);
};

export const getParentCategories = (id: number): Category[] => {
  const result: Category[] = [];
  let category = getCategoryById(id);

  while (category?.parent_id) {
    const parent = getCategoryById(category.parent_id);
    if (parent) {
      result.unshift(parent);
      category = parent;
    } else {
      break;
    }
  }

  return result;
};

export type ToolType = '대바늘' | '코바늘';
export type PatternType = '서술형' | '차트형' | '혼합형';
export type PublishStatus = '공개' | '비공개';

export type ConstructionMethod = '탑다운' | '바텀업' | '조각잇기형' | '원통형';
export type SleeveType = '래글런형' | '셋인형' | '요크형' | '새들숄더형' | '드롭숄더형' | '베스트형';
export type NecklineType = '라운드넥' | '브이넥' | '스퀘어넥';

// Measurement item types
export const MEASUREMENT_ITEMS = [
  '어깨처짐', '뒷목깊이', '앞목깊이', '진동길이', '옆길이', '목너비',
  '어깨너비', '가슴너비', '소매 길이', '소매 너비', '손목 너비',
  '소매 고무단 길이', '목 고무단 길이', '아랫단 고무단 길이'
] as const;

export type MeasurementItem = typeof MEASUREMENT_ITEMS[number];

export const CONSTRUCTION_METHODS: ConstructionMethod[] = ['탑다운', '바텀업', '조각잇기형', '원통형'];
export const SLEEVE_TYPES: SleeveType[] = ['래글런형', '셋인형', '요크형', '새들숄더형', '드롭숄더형', '베스트형'];
export const NECKLINE_TYPES: NecklineType[] = ['라운드넥', '브이넥', '스퀘어넥'];

// Size Range Types
export type SizeRange =
  | '50-53' | '54-57' | '58-61' | '62-65' | '66-69' | '70-73'
  | '74-79' | '80-84' | '85-89' | '90-94' | '95-99' | '100-104'
  | '105-109' | '110-114' | '115-120' | '121-129' | 'min' | 'max';

// Define size detail types
export type SizeDetail = {
  sizeRange: SizeRange;
  measurements: Record<MeasurementItem, number>;
};

export type Template = {
  id: string;
  name: string;
  toolType: ToolType;
  patternType: PatternType;
  thumbnail: string;
  publishStatus: PublishStatus;
  lastModified: string;
  categoryIds: number[];
  constructionMethods?: ConstructionMethod[];
  sleeveType?: SleeveType;
  necklineType?: NecklineType;
  measurementItems?: string[];
  chartTypeIds?: string[]; // 차트 유형 ID 배열로 변경
  measurementRuleId?: string; // Updated Template interface to include link to measurement rule
  sizeDetails?: SizeDetail[]; // 각 사이즈별 세부 치수 정보
};

// Sample template data
export const templates: Template[] = [
  {
    id: '1',
    name: '베이직 스웨터',
    toolType: '대바늘',
    patternType: '혼합형',
    thumbnail: '/thumbnails/sweater.jpg',
    publishStatus: '공개',
    lastModified: '2024-04-10',
    categoryIds: [1, 10, 103],
    constructionMethods: ['탑다운'],
    sleeveType: '래글런형',
    necklineType: '라운드넥',
    measurementItems: ['어깨너비', '가슴너비', '소매 길이', '소매 너비', '손목 너비', '목너비'],
    chartTypeIds: ['chart1'], // 배열로 변경
    measurementRuleId: 'rule1', // 래글런형 스웨터 치수 규칙 ID 연결
    sizeDetails: [
      {
        sizeRange: '50-53',
        measurements: {
          "어깨처짐": 0.6,
      "뒷목깊이": 1.2,
      "앞목깊이": 1.8,
      "진동길이": 13.0,
      "옆길이": 22.0,
      "목너비": 15.0,
      "어깨너비": 30.0,
      "가슴너비": 32.0,
      "소매 길이": 40.0,
      "소매 너비": 12.0,
      "손목 너비": 6.0,
      "소매 고무단 길이": 3,
      "목 고무단 길이": 1.5,
      "아랫단 고무단 길이": 3.0
        }
      },
      {
        sizeRange: '54-57',
        measurements: {
          "어깨처짐": 0.9,
      "뒷목깊이": 1.5,
      "앞목깊이": 1.8,
      "진동길이": 14.5,
      "옆길이": 23.0,
      "목너비": 15.5,
      "어깨너비": 32.0,
      "가슴너비": 34.0,
      "소매 길이": 45.0,
      "소매 너비": 13.0,
      "손목 너비": 6.0,
      "소매 고무단 길이": 3,
      "목 고무단 길이": 1.5,
      "아랫단 고무단 길이": 3.0
        }
      },
      {
        "sizeRange": "58-61",
        "measurements": {
          "어깨처짐": 1.2,
          "뒷목깊이": 1.8,
          "앞목깊이": 1.8,
          "진동길이": 15.5,
          "옆길이": 23.5,
          "목너비": 16.0,
          "어깨너비": 34.0,
          "가슴너비": 36.0,
          "소매 길이": 50.0,
          "소매 너비": 14.0,
          "손목 너비": 6.0,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 3.0
        }
      },
      
      {
        "sizeRange": "62-65",
        "measurements": {
          "어깨처짐": 1.5,
          "뒷목깊이": 1.8,
          "앞목깊이": 2.1,
          "진동길이": 16.5,
          "옆길이": 24.0,
          "목너비": 16.0,
          "어깨너비": 36.0,
          "가슴너비": 38.0,
          "소매 길이": 55.0,
          "소매 너비": 15.0,
          "손목 너비": 6.0,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 3.0
        }
      },
      {
        "sizeRange": "66-69",
        "measurements": {
          "어깨처짐": 1.8,
          "뒷목깊이": 2.1,
          "앞목깊이": 2.1,
          "진동길이": 17.5,
          "옆길이": 24.5,
          "목너비": 16.5,
          "어깨너비": 38.0,
          "가슴너비": 40.0,
          "소매 길이": 57.0,
          "소매 너비": 15.0,
          "손목 너비": 7.0,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 3.0
        }
      },
      {
        "sizeRange": "70-73",
        "measurements": {
          "어깨처짐": 2.1,
          "뒷목깊이": 2.1,
          "앞목깊이": 2.1,
          "진동길이": 18.5,
          "옆길이": 25.0,
          "목너비": 17.0,
          "어깨너비": 40.0,
          "가슴너비": 42.0,
          "소매 길이": 59.0,
          "소매 너비": 15.5,
          "손목 너비": 7.0,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 3.0
        }
      },
      {
        "sizeRange": "74-79",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 19.5,
          "옆길이": 26.0,
          "목너비": 17.0,
          "어깨너비": 42.0,
          "가슴너비": 45.0,
          "소매 길이": 60.0,
          "소매 너비": 16.0,
          "손목 너비": 8.0,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 3.0
        }
      },
      {
        "sizeRange": "80-84",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 20.5,
          "옆길이": 23.6,
          "목너비": 16.0,
          "어깨너비": 42.0,
          "가슴너비": 52.0,
          "소매 길이": 61.0,
          "소매 너비": 16.0,
          "손목 너비": 9.5,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 1.5,
          "아랫단 고무단 길이": 4.0
        }
      },
      {
        "sizeRange": "85-89",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 22.0,
          "옆길이": 27.0,
          "목너비": 18.0,
          "어깨너비": 45.0,
          "가슴너비": 50.0,
          "소매 길이": 61.5,
          "소매 너비": 16.5,
          "손목 너비": 9.5,
          "소매 고무단 길이": 4,
          "목 고무단 길이": 2.0,
          "아랫단 고무단 길이": 5.0
        }
      },
      {
        "sizeRange": "90-94",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 23.0,
          "옆길이": 28.0,
          "목너비": 19.0,
          "어깨너비": 47.0,
          "가슴너비": 54.0,
          "소매 길이": 62.0,
          "소매 너비": 17.0,
          "손목 너비": 10.0,
          "소매 고무단 길이": 4,
          "목 고무단 길이": 2.0,
          "아랫단 고무단 길이": 5.0
        }
      },
      {
        "sizeRange": "95-99",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 25.0,
          "옆길이": 29.0,
          "목너비": 19.0,
          "어깨너비": 50.0,
          "가슴너비": 57.0,
          "소매 길이": 62.5,
          "소매 너비": 18.0,
          "손목 너비": 10.0,
          "소매 고무단 길이": 4,
          "목 고무단 길이": 2.0,
          "아랫단 고무단 길이": 5.0
        }
      },
      {
        "sizeRange": "100-104",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 26.0,
          "옆길이": 30.0,
          "목너비": 20.0,
          "어깨너비": 52.0,
          "가슴너비": 60.0,
          "소매 길이": 63.0,
          "소매 너비": 19.0,
          "손목 너비": 10.0,
          "소매 고무단 길이": 4,
          "목 고무단 길이": 2.5,
          "아랫단 고무단 길이": 5.0
        }
      },
      {
        "sizeRange": "105-109",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 27.0,
          "옆길이": 31.0,
          "목너비": 20.0,
          "어깨너비": 55.0,
          "가슴너비": 63.0,
          "소매 길이": 63.0,
          "소매 너비": 19.0,
          "손목 너비": 10.5,
          "소매 고무단 길이": 4,
          "목 고무단 길이": 2.5,
          "아랫단 고무단 길이": 6.0
        }
      },
      {
        "sizeRange": "110-114",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 28.0,
          "옆길이": 32.0,
          "목너비": 20.0,
          "어깨너비": 57.0,
          "가슴너비": 65.0,
          "소매 길이": 63.5,
          "소매 너비": 20.0,
          "손목 너비": 10.5,
          "소매 고무단 길이": 5,
          "목 고무단 길이": 3.0,
          "아랫단 고무단 길이": 6.0
        }
      },
      {
        "sizeRange": "115-120",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 30.0,
          "옆길이": 33.1,
          "목너비": 21.0,
          "어깨너비": 60.0,
          "가슴너비": 68.0,
          "소매 길이": 63.5,
          "소매 너비": 20.7,
          "손목 너비": 11.0,
          "소매 고무단 길이": 6,
          "목 고무단 길이": 3.2,
          "아랫단 고무단 길이": 6.5
        }
      },
      {
        "sizeRange": "121-129",
        "measurements": {
          "어깨처짐": 2.4,
          "뒷목깊이": 2.4,
          "앞목깊이": 2.4,
          "진동길이": 30.0,
          "옆길이": 33.1,
          "목너비": 21.7,
          "어깨너비": 62.0,
          "가슴너비": 68.0,
          "소매 길이": 63.5,
          "소매 너비": 20.7,
          "손목 너비": 11.0,
          "소매 고무단 길이": 6,
          "목 고무단 길이": 3.2,
          "아랫단 고무단 길이": 6.5
        }
      },
      {
        sizeRange: 'min',
        measurements: {
          "어깨처짐": 2,
          "뒷목깊이": 2,
          "앞목깊이": 2,
          "진동길이": 2,
          "옆길이": 5,
          "목너비": 2,
          "어깨너비": 3,
          "가슴너비": 3,
          "소매 길이": 5,
          "소매 너비": 3,
          "손목 너비": 2,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 2,
          "아랫단 고무단 길이": 2
        }
      },
      {
        sizeRange: 'max',
        measurements: {
          "어깨처짐": 2,
          "뒷목깊이": 2,
          "앞목깊이": 2,
          "진동길이": 2,
          "옆길이": 5,
          "목너비": 2,
          "어깨너비": 3,
          "가슴너비": 3,
          "소매 길이": 5,
          "소매 너비": 3,
          "손목 너비": 2,
          "소매 고무단 길이": 3,
          "목 고무단 길이": 2,
          "아랫단 고무단 길이": 2
        }
      }
    ]
  },
  {
    id: '2',
    name: '비니',
    toolType: '코바늘',
    patternType: '서술형',
    thumbnail: '/thumbnails/beanie.jpg',
    publishStatus: '공개',
    lastModified: '2024-04-09',
    categoryIds: [2, 20, 301],
    measurementItems: ['머리둘레'],
    chartTypeIds: [] // 빈 배열 추가
  }
];

export type ChartType = {
  id: string;
  name: string;
};

export const chartTypes: ChartType[] = [
  { id: 'chart1', name: '앞 몸판' },
  { id: 'chart2', name: '뒤 몸판' },
  { id: 'chart3', name: '소매' },
  { id: 'chart4', name: '카라' },
  { id: 'chart5', name: '포켓' },
  { id: 'chart6', name: '후드' }
];

export type MeasurementRule = {
  id: string;
  categoryId: number;
  sleeveType?: SleeveType;
  name: string;
  items: MeasurementItem[];
};

// Updated measurement rules array
export const measurementRules: MeasurementRule[] = [
  {
    id: 'rule1',
    categoryId: 103, // 스웨터
    sleeveType: '래글런형',
    name: '래글런형 스웨터',
    items: ['어깨너비', '가슴너비', '소매 길이', '소매 너비', '손목 너비', '목너비']
  },
  {
    id: 'rule2',
    categoryId: 103, // 스웨터
    sleeveType: '셋인형',
    name: '셋인형 스웨터',
    items: ['어깨너비', '가슴너비', '소매 길이', '소매 너비', '진동길이']
  },
];

// Function to check if a rule exists for a category and sleeve type
export function findMeasurementRule(categoryId: number, sleeveType?: SleeveType): MeasurementRule | undefined {
  if (sleeveType) {
    return measurementRules.find(rule =>
      rule.categoryId === categoryId && rule.sleeveType === sleeveType
    );
  }
  return measurementRules.find(rule =>
    rule.categoryId === categoryId && !rule.sleeveType
  );
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
};

export const users: User[] = [
  { id: '1', name: '김수지', email: 'admin@example.com', role: '관리자', status: '활성', lastLogin: '2024-04-10' },
  { id: '2', name: '변수미', email: 'user@example.com', role: '일반', status: '활성', lastLogin: '2024-04-08' }
];

// Size ranges in order
export const SIZE_RANGES: SizeRange[] = [
  '50-53', '54-57', '58-61', '62-65', '66-69', '70-73',
  '74-79', '80-84', '85-89', '90-94', '95-99', '100-104',
  '105-109', '110-114', '115-120', '121-129', 'min', 'max'
];
