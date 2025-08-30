<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotion</title>
    <link rel="stylesheet" href="../../assets/vendor/bootstrap/css/bootstrap.css" />

</head>

<body>


  <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
    <h5>Advance Promotion</h5>
    <!-- Tabs -->
    <ul class="nav nav-tabs" id="conditionTab">
        <li class="nav-item">
            <a class="nav-link nonActive" data-target="#basic-content" href="#">Basic</a>
        </li>
        <li class="nav-item">
            <a class="nav-link active" data-target="#advance-content" href="#">Advance</a>
        </li>
    </ul>
    <button id="btn-close-condition" class="btn btn-secondary">X</button>
  </div>

  <div id="blocklyContainer" style=" width:100%; height:100%;">
    <div id="blocklyDiv" style="position:absolute; left:0; width:100%; height:100%;"></div>
  </div>

    <!-- <script src="https://unpkg.com/blockly/msg/th.js"></script> -->

    <!-- Scripts -->
    <script src="../../assets/vendor/bootstrap/js/bootstrap.js"></script>
    <script src="advanceCondition.js"></script>
</body>
</html>