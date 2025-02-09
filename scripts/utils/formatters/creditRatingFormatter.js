// 신용등급에서 기본 등급만 추출 (예: AA+, AA-, AA0 -> AA)
const extractBaseRating = (rating) => {
  if (!rating) return null;

  const ratingMap = {
    AAA: "AAA",
    AA: "AA",
    A: "A",
    BBB: "BBB",
    BB: "BB",
    B: "B",
    CCC: "CCC",
    CC: "CC",
    C: "C",
    D: "D",
  };

  for (const [baseRating] of Object.entries(ratingMap)) {
    if (rating.includes(baseRating)) {
      return baseRating;
    }
  }
  return null;
};

// 신용등급 순위 맵핑 (높은 순서대로)
const ratingRank = {
  AAA: 1,
  AA: 2,
  A: 3,
  BBB: 4,
  BB: 5,
  B: 6,
  CCC: 7,
  CC: 8,
  C: 9,
  D: 10,
};

// 여러 신용등급 중 가장 낮은 등급 반환
const getLowestRating = (ratings) => {
  const validRatings = ratings.filter((r) => r !== null);
  if (validRatings.length === 0) return null;

  return validRatings.reduce((lowest, current) => {
    if (!lowest) return current;
    return ratingRank[current] > ratingRank[lowest] ? current : lowest;
  });
};

// 통합 신용등급 계산
const calculateCreditRating = (kisRating, kbpRating, niceRating, fnRating) => {
  // 기본 등급 추출
  const baseRatings = [
    extractBaseRating(kisRating),
    extractBaseRating(kbpRating),
    extractBaseRating(niceRating),
    extractBaseRating(fnRating),
  ];

  // 유효한 등급만 필터링
  const validRatings = baseRatings.filter((r) => r !== null);
  if (validRatings.length === 0) return null;

  // 모든 등급이 동일한지 확인
  const allSame = validRatings.every((r) => r === validRatings[0]);
  if (allSame) return validRatings[0];

  // 다른 등급이 있는 경우 가장 낮은 등급 반환
  return getLowestRating(validRatings);
};

module.exports = { calculateCreditRating };
