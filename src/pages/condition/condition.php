<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotion</title>
    <link rel="stylesheet" href="../../components/modal/modalPromotionCondition/modalPromotionCondition.css">
    <link rel="stylesheet" href="../../assets/vendor/bootstrap/css/bootstrap.css" />
</head>

<body>

<!-- Modal -->


    <!-- Header -->

    <!-- Content -->
    <div id="blocklyDiv" style="height: 600px; width: 1000px;"></div>





    <!-- Load Blockly -->
    <script src="/myPromotion/src/assets/vendor/blockly/blockly_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/blocks_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/javascript_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/msg/en.js"></script>
    <!-- <script src="https://unpkg.com/blockly/msg/th.js"></script> -->

    <!-- Scripts -->
    <script type="module" src="../../components/modal/modalPromotionCondition/modalPromotionCondition.js"></script>
    <script src="../../assets/vendor/bootstrap/js/bootstrap.js"></script>

    <script>

    var toolbox = {
    "kind": "flyoutToolbox",
    "contents": [
      {
        "kind": "block",
        "type": "controls_if"
      },
      {
        "kind": "block",
        "type": "controls_whileUntil"
      }
    ]
  };
  
    
    // const workspace = Blockly.inject(
    // document.getElementById('blocklyDiv'), { 
    //     toolbox: toolbox,
    //     zoom:
    //         {controls: true,
    //         wheel: true,
    //         startScale: 1.0,
    //         maxScale: 3,
    //         minScale: 0.3,  
    //         scaleSpeed: 1.2,
    //         pinch: true},
    //     scrollbars: true,
    //     trashcan: true,
    //     grid: { spacing: 20, length: 2, colour: '#ff0000ff', snap: true },
    //      media: 'https://unpkg.com/blockly/media/',
    //  });

    //  workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

    


  </script>
</body>
</html>