export const triggerPaperPushTransition = (onFinish?: () => void) => {
  // 1. The "Old" Page pushes back into the distance
  const oldNode = document.documentElement.animate(
    [
      {
        scale: 1,
        transform: "translateY(0%)",
        rotate: "0deg",
        opacity: 1,
        filter: "brightness(1)",
      },
      {
        scale: 0.9,
        transform: "translateY(-5%)",
        rotate: "-2deg",
        opacity: 0.8,
        filter: "brightness(0.5)",
      },
    ],
    {
      duration: 800,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    },
  );

  // 2. The "New" Page slides up from the bottom
  document.documentElement.animate(
    [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
    {
      duration: 800,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    },
  );

  oldNode.onfinish = () => {
    if (onFinish) onFinish();
  };
};
