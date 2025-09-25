<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotion</title>
    <link rel="stylesheet" href="../../assets/vendor/bootstrap/css/bootstrap.css" />
    <link rel="stylesheet" href="promotion.css"/>
    <link rel="stylesheet" href="../../assets/css/font.css">
    <link rel="stylesheet" href="../../components/header/header.css">
    <link rel="stylesheet" href="../../components/card/card.css">
    <link rel="stylesheet" href="../../components/searchBar/searchBar.css">
    <link rel="stylesheet" href="../../components/status-count/status-count.css">
    <link rel="stylesheet" href="../../components/pagination/pagination.css">
    <link rel="stylesheet" href="../../components/campaignEditor/campaignEditor.css">
    <link rel="stylesheet" href="../../assets/css/main.css">
    <link rel="stylesheet" href="../../components/modal/modalProductList/modalProductList.css">
    <link rel="stylesheet" href="../../components/Condition/modalCondition.css">
    <link rel="stylesheet" href="../../components/modal/SelectStatus/modalSelectStatus.css">
    <link rel="stylesheet" href="../../assets/vendor/bootstrap-table/bootstrap-table.min.css">
    <link rel="stylesheet" href="../../components/Condition/modalConditionAdvance/advanceCondition.css">
    <link rel="stylesheet" href="../../assets/vendor/bootstrap/icons-main/font/bootstrap-icons.min.css"> <!-- icon -->

    <!-- Select2 -->
    <link rel="stylesheet" href="../../assets/vendor/select2/css/select2.min.css" />
    <link rel="stylesheet" href="../../assets/vendor/select2/theme/select2-bootstrap-5-theme.min.css"/>

    <!-- Flatpickr -->
    <link rel="stylesheet" href="../../assets/vendor/flatpickr/flatpickr.min.css">

    <!-- Customer -->
     <link rel="stylesheet" href="/myPromotion/src/components/Customer/Customer_Editor/Customer_Editor.css">
    <link rel="stylesheet" href="/myPromotion/src/components/Customer/Customer_Add/Customer_Add.css">
    
</head>

<body>

<!-- Modal -->
<?php include('../../components/modal/CreatePromotion/modalCreatePromotion.html'); ?>
<?php include('../../components/modal/SelectStatus/modalSelectStatus.html'); ?>
<?php include('../../components/modal/modalProductList/modalProductList.html'); ?>
<?php include('../../components/Condition/modalCondition.html'); ?>
<?php include('../../components/Condition/modalConditionAdvance/advanceCondition.html'); ?>
<?php include('../../components/Customer/Customer_Editor/Customer_Editor.html'); ?>
<?php include('../../components/Customer/Customer_Add/Customer_Add.html'); ?>


<!-- Header -->
    <?php include_once('../../components/header/header.html'); ?>
    <div id="alert-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1055;"></div>
    <div class="content">
        <?php include('../../components/campaignEditor/campaignEditor.html');?>
        <div class="main-content">
            <!-- card-count and add button -->
            <div class="top-content">
                <?php include_once('../../components/status-count/status-count.html'); ?>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#my-form">เพิ่มโปรโมชั่น</button>
            </div>
            <!-- Search bar -->
            <?php include('../../components/searchBar/searchBar.html'); ?>

            <!-- Card -->
            <div class="card-container" id="searchInputCards"></div>
        </div>
    </div>
    <?php include_once('../../components/pagination/pagination.html');?>


    <!-- ======= libs (single copy, ordered) ======= -->
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

    <!-- Bootstrap: load bundle ONCE (includes Popper) -->
    <script src="../../assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- bootstrap-table (after bootstrap) -->
    <script src="../../assets/vendor/bootstrap-table/bootstrap-table.min.js"></script>
    <script src="../../assets/vendor/bootstrap-table/extensions/export/bootstrap-table-export.min.js"></script>
    <script src="../../assets/vendor/bootstrap-table/locale/bootstrap-table-th-TH.min.js"></script>

    <!-- tableExport (if needed) -->
    <script src="../../assets/vendor/tableExport.min.js"></script>

    <!-- Select2, Flatpickr -->
    <script src="../../assets/vendor/select2/js/select2.min.js"></script>
    <script src="../../assets/vendor/flatpickr/flatpickr"></script>
    <script src="../../assets/vendor/flatpickr/th.js"></script>

    <!-- Blockly (if used) - keep but avoid duplicate loads -->
    <script src="/myPromotion/src/assets/vendor/blockly/blockly_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/blocks_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/javascript_compressed.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/msg/th.js"></script>
    <script src="/myPromotion/src/assets/vendor/blockly/php_compressed.js"></script>

    <!-- your normal scripts (non-module) -->
    <script src="/myPromotion/src/assets/js/form-validation.js"></script>
    <script src="promotion.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/modalConditionAdvance/advanceCondition.js"></script>

    <!-- ======= Your modules (type=module) - load AFTER libs ======= -->
    <script type="module" src="/myPromotion/src/components/Condition/ConditionInit.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionEvents.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionTemplates.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionIndex.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionForm.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionHelpers.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionParser.js"></script>
    <script type="module" src="/myPromotion/src/components/Condition/ConditionService.js"></script>

    <script type="module" src="/myPromotion/src/components/modal/modalProductList/modalProductList.js"></script>
    <script type="module" src="/myPromotion/src/components/status-count/status-count.js"></script>
    <script type="module" src="../../components/campaignEditor/campaignEditor.js"></script>
    <script type="module" src="../../components/searchBar/searchBar.js"></script>   
    <script type="module" src="../../assets/js/main.js"></script>
    <script type="module" src="/myPromotion/src/components/modal/CreatePromotion/modalCreatePromotion.js"></script>

    <!-- Customer components: modules that depend on jQuery & bootstrap-table (these run after libs) -->
    <script type="module" src="/myPromotion/src/components/Customer/Customer_Add/Customer_Add.js"></script>
    <script type="module" src="/myPromotion/src/components/Customer/Customer_Editor/Customer_Editor.js"></script>
    <script type="module" src="/myPromotion/src/components/Customer/Customer.js"></script>

</body>
</html>



