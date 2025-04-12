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

// Update measurement item types
export type MeasurementItemData = {
  id: string;
  name: string;
  category: string; // 항목 분류 (예: 상의, 하의, 소매 등 중분류 카테고리 기준)
  section: string; // 세부 섹션 (몸통, 소매 등)
  unit: string; // 단위 (cm, mm 등)
  description: string; // 측정 방법 설명
};

// 하드코딩된 array 대신 API에서 가져올 측정 항목들
export const measurementItems: MeasurementItemData[] = [
  // 상의 관련 측정 항목
  { id: 'shoulder_slope', name: '어깨처짐', category: '상의', section: '몸통', unit: 'cm', description: '어깨 기울기 측정' },
  { id: 'shoulder_width', name: '어깨너비', category: '상의', section: '몸통', unit: 'cm', description: '어깨 끝점 간 거리' },
  { id: 'back_neck_depth', name: '뒷목깊이', category: '상의', section: '몸통', unit: 'cm', description: '뒷목 깊이 측정' },
  { id: 'front_neck_depth', name: '앞목깊이', category: '상의', section: '몸통', unit: 'cm', description: '앞목 깊이 측정' },
  { id: 'neck_width', name: '목너비', category: '상의', section: '몸통', unit: 'cm', description: '목 둘레 측정' },
  { id: 'chest_width', name: '가슴너비', category: '상의', section: '몸통', unit: 'cm', description: '가슴 둘레 측정' },
  { id: 'waist_width', name: '허리 너비', category: '상의', section: '몸통', unit: 'cm', description: '허리 둘레 측정' },
  { id: 'hip_width', name: '엉덩이 너비', category: '상의', section: '몸통', unit: 'cm', description: '엉덩이 둘레 측정' },
  { id: 'total_length', name: '총장', category: '상의', section: '몸통', unit: 'cm', description: '어깨부터 아랫단까지 길이' },
  { id: 'arm_hole_length', name: '진동길이', category: '상의', section: '몸통', unit: 'cm', description: '어깨부터 겨드랑이까지 길이' },
  { id: 'side_length', name: '옆길이', category: '상의', section: '몸통', unit: 'cm', description: '겨드랑이부터 밑단까지 길이' },

  { id: 'sleeve_length', name: '소매 길이', category: '상의', section: '소매', unit: 'cm', description: '어깨부터 소매 끝까지 길이' },
  { id: 'sleeve_width', name: '소매 너비', category: '상의', section: '소매', unit: 'cm', description: '소매 통 둘레' },
  { id: 'wrist_width', name: '손목 너비', category: '상의', section: '소매', unit: 'cm', description: '손목 둘레 측정' },

  // 하의 관련 측정 항목
  { id: 'waist_circumference', name: '허리둘레', category: '하의', section: '허리/엉덩이', unit: 'cm', description: '허리 둘레 측정' },
  { id: 'hip_circumference', name: '엉덩이둘레', category: '하의', section: '허리/엉덩이', unit: 'cm', description: '엉덩이 둘레 측정' },
  { id: 'rise', name: '밑위', category: '하의', section: '허리/엉덩이', unit: 'cm', description: '허리선에서 가랑이까지 길이' },

  { id: 'thigh_width', name: '허벅지 너비', category: '하의', section: '다리', unit: 'cm', description: '허벅지 둘레 측정' },
  { id: 'knee_width', name: '무릎 너비', category: '하의', section: '다리', unit: 'cm', description: '무릎 둘레 측정' },
  { id: 'hem_width', name: '밑단 너비', category: '하의', section: '다리', unit: 'cm', description: '바지 밑단 너비 측정' },
  { id: 'inseam', name: '인심', category: '하의', section: '다리', unit: 'cm', description: '가랑이에서 발목까지 길이' },
  { id: 'outseam', name: '아웃심', category: '하의', section: '다리', unit: 'cm', description: '허리에서 발목까지 바깥쪽 길이' },

  // 마감재 관련 측정 항목
  { id: 'sleeve_ribbing_length', name: '소매 고무단 길이', category: '마감', section: '고무단/밴드', unit: 'cm', description: '소매 고무단 길이' },
  { id: 'neck_ribbing_length', name: '목 고무단 길이', category: '마감', section: '고무단/밴드', unit: 'cm', description: '목 고무단 길이' },
  { id: 'bottom_ribbing_length', name: '아랫단 고무단 길이', category: '마감', section: '고무단/밴드', unit: 'cm', description: '아랫단 고무단 길이' },
  { id: 'waistband_width', name: '허리밴드 너비', category: '마감', section: '고무단/밴드', unit: 'cm', description: '허리밴드 너비 측정' },

  // 액세서리 관련 측정 항목
  { id: 'head_circumference', name: '머리둘레', category: '액세서리', section: '모자', unit: 'cm', description: '머리 둘레 측정' },
  { id: 'hood_height', name: '후드 높이', category: '액세서리', section: '후드', unit: 'cm', description: '후드 높이 측정' },
  { id: 'hood_width', name: '후드 너비', category: '액세서리', section: '후드', unit: 'cm', description: '후드 너비 측정' },
  { id: 'pocket_width', name: '주머니 너비', category: '액세서리', section: '주머니', unit: 'cm', description: '주머니 너비 측정' },
  { id: 'pocket_height', name: '주머니 높이', category: '액세서리', section: '주머니', unit: 'cm', description: '주머니 높이 측정' }
];

// 측정 항목 카테고리별 그룹핑 (프론트엔드에서 사용)
export const measurementItemsByCategory = () => {
  const grouped: Record<string, MeasurementItemData[]> = {};

  measurementItems.forEach(item => {
    const category = item.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
};

// 측정 항목 세부 섹션별 그룹핑 (프론트엔드에서 사용)
export const measurementItemsBySection = () => {
  const grouped: Record<string, Record<string, MeasurementItemData[]>> = {};

  measurementItems.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = {};
    }

    if (!grouped[item.category][item.section]) {
      grouped[item.category][item.section] = [];
    }

    grouped[item.category][item.section].push(item);
  });

  return grouped;
};

// 기존 측정 항목 배열 (하위 호환성 유지)
export const MEASUREMENT_ITEMS = measurementItems.map(item => item.name) as const;
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

// Helper function to get measurement item by ID
export const getMeasurementItemById = (id: string): MeasurementItemData | undefined => {
  return measurementItems.find(item => item.id === id);
};

// Helper function to get measurement item by name (for backward compatibility)
export const getMeasurementItemByName = (name: string): MeasurementItemData | undefined => {
  return measurementItems.find(item => item.name === name);
};

// Helper function to get measurement item names from IDs
export const getMeasurementItemNames = (itemIds: string[]): string[] => {
  return itemIds.map(id => {
    const item = getMeasurementItemById(id);
    return item?.name || id;
  });
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
    measurementItems: ['shoulder_width', 'chest_width', 'sleeve_length', 'sleeve_width', 'wrist_width', 'neck_width'],
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
        sizeRange: '58-61',
        measurements: {
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
        sizeRange: '62-65',
        measurements: {
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
        sizeRange: '66-69',
        measurements: {
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
        sizeRange: '70-73',
        measurements: {
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
        sizeRange: '74-79',
        measurements: {
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
        sizeRange: '80-84',
        measurements: {
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
        sizeRange: '85-89',
        measurements: {
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
        sizeRange: '90-94',
        measurements: {
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
        sizeRange: '95-99',
        measurements: {
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
        sizeRange: '100-104',
        measurements: {
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
        sizeRange: '105-109',
        measurements: {
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
        sizeRange: '110-114',
        measurements: {
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
        sizeRange: '115-120',
        measurements: {
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
        sizeRange: '121-129',
        measurements: {
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
    measurementItems: ['head_circumference'],
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

// Updated measurement rule type to use both id and name for compatibility
export type MeasurementRule = {
  id: string;
  categoryId: number;
  sleeveType?: SleeveType;
  name: string;
  items: string[]; // 측정 항목 ID 배열로 변경
};

// Updated measurement rules array
export const measurementRules: MeasurementRule[] = [
  {
    id: 'rule1',
    categoryId: 103, // 스웨터
    sleeveType: '래글런형',
    name: '래글런형 스웨터',
    items: ['shoulder_width', 'chest_width', 'sleeve_length', 'sleeve_width', 'wrist_width', 'neck_width']
  },
  {
    id: 'rule2',
    categoryId: 103, // 스웨터
    sleeveType: '셋인형',
    name: '셋인형 스웨터',
    items: ['shoulder_width', 'chest_width', 'sleeve_length', 'sleeve_width', 'arm_hole_length']
  },
];

// Function to check if a rule exists for a category and sleeve type
export function findMeasurementRule(categoryId: number, sleeveType?: SleeveType): MeasurementRule | undefined {
  // 디버그용 로그 추가
  console.log(`Finding measurement rule for categoryId: ${categoryId}, sleeveType: ${sleeveType || 'undefined'}`);
  console.log("Available rules:", measurementRules.map(r => ({
    id: r.id,
    categoryId: r.categoryId,
    sleeveType: r.sleeveType || 'undefined',
    match: r.categoryId === categoryId && (sleeveType ? r.sleeveType === sleeveType : !r.sleeveType)
  })));

  if (sleeveType) {
    return measurementRules.find(rule =>
      rule.categoryId === categoryId && rule.sleeveType === sleeveType
    );
  }
  return measurementRules.find(rule =>
    rule.categoryId === categoryId && !rule.sleeveType
  );
}

// Function to get a measurement rule by ID
export function getMeasurementRuleById(ruleId: string | undefined): MeasurementRule | undefined {
  // ID가 없으면 undefined 반환
  if (!ruleId) {
    console.log("getMeasurementRuleById called with no ID");
    return undefined;
  }

  // 문자열 변환 및 공백 제거 후 비교
  const normalizedId = String(ruleId).trim();
  console.log(`Looking for rule with normalized ID: "${normalizedId}"`);

  // 이용 가능한 규칙 ID 로깅
  const availableRuleIds = measurementRules.map(r => r.id);
  console.log("Available rule IDs:", availableRuleIds);

  // 정확한 일치 먼저 시도
  let rule = measurementRules.find(r => r.id === normalizedId);
  if (rule) {
    console.log(`Found rule by exact match: ${rule.name}`);
    return rule;
  }

  // 문자열 변환 후 시도
  rule = measurementRules.find(r => String(r.id).trim() === normalizedId);
  if (rule) {
    console.log(`Found rule by string comparison: ${rule.name}`);
    return rule;
  }

  // 대소문자 무시 비교
  rule = measurementRules.find(r =>
    String(r.id).trim().toLowerCase() === normalizedId.toLowerCase()
  );
  if (rule) {
    console.log(`Found rule by case-insensitive comparison: ${rule.name}`);
    return rule;
  }

  console.log(`No rule found with ID "${normalizedId}"`);
  return undefined;
}

// Function to check if a rule would be a duplicate (excluding own ID when editing)
export function isDuplicateMeasurementRule(categoryId: number, sleeveType?: SleeveType, excludeId?: string): boolean {
  if (sleeveType) {
    return measurementRules.some(rule =>
      rule.categoryId === categoryId &&
      rule.sleeveType === sleeveType &&
      (!excludeId || rule.id !== excludeId)
    );
  }
  return measurementRules.some(rule =>
    rule.categoryId === categoryId &&
    !rule.sleeveType &&
    (!excludeId || rule.id !== excludeId)
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
