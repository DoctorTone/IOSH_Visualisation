// General parameters to help with setting up scene

const SceneConfig = {
    clearColour: 0x5c5f64,
    ambientLightColour: 0x383838,
    pointLightColour: 0xffffff,
    CameraPos: {
        x: 182,
        y: 50,
        z: 340
    },
    LookAtPos: {
        x: -70,
        y: -20,
        z: 40
    },
    NEAR_PLANE: 0.1,
    FAR_PLANE: 10000,
    FOV: 45,
    radius: 5,
    segments: 16,
    winHeight: 45,
    drawHeight: 30,
    loseHeight: 15,
    GroundWidth: 2000,
    GroundHeight: 1000,
    GroundSegments: 16,
    winColour: 0x00ff00,
    drawColour: 0xffbf00,
    loseColour: 0xff0000,
    teamStart: {
        x: 0,
        y: 15/2,
        z: -250
    },
    teamInc: 12,
    RESULT: 6,
    resultOffset: [3, 17.5, 45],
    animationTime: 0.15,
    LOGO_SCALE: 5,
    //Options
    SEASONS: "seasonsOption"
};

export { SceneConfig };