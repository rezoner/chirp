CHIRP.instruments.drumkit.presets = [{
  "0": [
    ["sweep", 3000, 200, 50]
  ],
  "1": [],
  "2": [
    ["add", [
        ["sweep", 4000, 300, 10],
        ["distort"],
        ["envelope", 0.1, 0.4, 0.2, 0.2],
        ["sinDistort", 1],
        ["gain", 1.7]
      ],
      [
        ["noise", 5000],
        ["resonantFilter", 0.05, 0.2, 0.2, 0.8],
        ["decay", 0.4],
        ["gain", 0.6]
      ]
    ]
  ],
  "3": [],
  "4": [
    ["sampleRate", 22000],
    ["noise", 8000],
    ["resonantFilter", 0.05, 0.9, 0.1, 0.7],
    ["decay", 0.9],
    ["gain", 1]
  ],
  "5": [
    ["white", 5000],
    ["decay", 1]
  ],
  "6": [
    ["brown", 5000],
    ["gain", 5],
    ["decay", 1]
  ],
  "7": [
    ["brown", 5000],
    ["gain", 5],
    ["decay", 1]
  ],
  "9": [
    ["pink", 10000],
    ["gain", 4],
    ["decay", 1]
  ],
  "11": [
    ["brown", 2000],
    ["sinDistort", 3],
    ["decay", 1],
    ["gain", 4]
  ]
}];