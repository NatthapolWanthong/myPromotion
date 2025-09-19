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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"> <!-- icon -->

    <!-- Modal -->
    <?php include('components/modal/CreateCampaign/modalCreateCampaign.html'); ?>
    <?php include('components/modal/SelectStatus/modalSelectStatus.html'); ?>

    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
    <!-- Select2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css"/>
    
    <script type="module">
        import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
        window.Swal = Swal; // ทำให้ SweetAlert ใช้ได้ใน window ทั่วไป
    </script>
</head>

<body>
<!-- Header -->
    <?php include_once('components/header/header.html'); ?>
    <div id="alert-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1055;"></div>
    <div class="content">
        <div class="main-content">
            <!-- card-count and add button -->
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


    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>


    <script type="module" src="/myPromotion/src/components/status-count/status-count.js"></script>
    <script type="module" src="/myPromotion/src/components/searchBar/searchBar.js"></script>
    <script type="module" src="/myPromotion/src/assets/js/main.js"></script>
    <script defer type="module" src="index.js"></script>
    <script defer type="module" src="/myPromotion/src/components/modal/CreateCampaign/modalCreateCampaign.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://npmcdn.com/flatpickr/dist/l10n/th.js"></script>
    <script src="/myPromotion/src/assets/js/form-validation.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    
</body>

</html>
<!-- <script type="text/javascript">

</script> -->