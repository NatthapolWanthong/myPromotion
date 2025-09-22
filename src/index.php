<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotion</title>
    <link rel="stylesheet" href="./assets/vendor/bootstrap/css/bootstrap.css" />
    <link rel="stylesheet" href="index.css"/>
    <link rel="stylesheet" href="/myPromotion/src/assets/css/font.css">
    <link rel="stylesheet" href="/myPromotion/src/components/header/header.css">
    <link rel="stylesheet" href="/myPromotion/src/components/card/card.css">
    <link rel="stylesheet" href="/myPromotion/src/components/searchBar/searchBar.css">
    <link rel="stylesheet" href="/myPromotion/src/components/status-count/status-count.css">
    <link rel="stylesheet" href="/myPromotion/src/components/modal/SelectStatus/modalSelectStatus.css">
    <link rel="stylesheet" href="/myPromotion/src/components/pagination/pagination.css">
    <link rel="stylesheet" href="/myPromotion/src/assets/css/main.css">
    <link rel="stylesheet" href="./assets/vendor/flatpickr/flatpickr.min.css">
    <link rel="stylesheet" href="./assets/vendor/bootstrap/icons-main/font/bootstrap-icons.min.css"> <!-- icon -->

    <!-- Modal -->
    <?php include('components/modal/CreateCampaign/modalCreateCampaign.html'); ?>
    <?php include('components/modal/SelectStatus/modalSelectStatus.html'); ?>

    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
    
    <!-- Select2 -->
    <link rel="stylesheet" href="./assets/vendor/select2/css/select2.min.css"/>
    <link rel="stylesheet" href="./assets/vendor/select2/theme/select2-bootstrap-5-theme.min.css"/>
</head>

<body>
<!-- Header -->
    <?php include_once('components/header/header.html'); ?>
    <div id="alert-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1055;"></div>
    <div class="content">
        <div class="main-content">
            <div class="top-content">
                <?php include_once('components/status-count/status-count.html'); ?>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#my-form">เพิ่มกิจกรรม</button>
            </div>
            <!-- Search bar -->
            <?php include('components/searchBar/searchBar.html'); ?>

            <!-- Card -->
            <div class="card-container" id="searchInputCards"></div>
        </div>
    </div>
    <?php include_once('components/pagination/pagination.html');?>

    
    <script src="./assets/vendor/bootstrap/js/bootstrap.js"></script>
    <script src="/myPromotion/src/assets/vendor/bootstrap/js/bootstrap.bundle.js"></script>


    <script src="./assets/vendor/select2/js/select2.js"></script>


    <script type="module" src="/myPromotion/src/components/status-count/status-count.js"></script>
    <script type="module" src="/myPromotion/src/components/searchBar/searchBar.js"></script>
    <script type="module" src="/myPromotion/src/assets/js/main.js"></script>
    <script defer type="module" src="index.js"></script>
    <script defer type="module" src="/myPromotion/src/components/modal/CreateCampaign/modalCreateCampaign.js"></script>
    <script src="./assets/vendor/flatpickr/flatpickr"></script>
    <script src="./assets/vendor/flatpickr/th.js"></script>
    <script src="/myPromotion/src/assets/js/form-validation.js"></script>    
</body>

</html>