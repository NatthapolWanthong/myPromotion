<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="./assets/vendor/bootstrap/css/bootstrap.css" />
    <link rel="stylesheet" href="style.css" />
    <link el="stylesheet" href="./dist/output.css" />
</head>

<body>
    <?php
    include_once('components/header/header.php');
    ?>
    <div class="content">
        <div class="main-content">
            <div class="top-content">
                <?php include_once('components/status count/status count.php'); ?>
                <button type="button" class="activity btn btn-primary">เพิ่มกิจกรรม</button>
            </div>

            <?php include('components/search-bar/search-bar.php'); ?>
            
            <div class="card-container">
                <?php
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                include('components/card/card.php');
                ?>
            </div>
        </div>
    </div>
</body>

</html>