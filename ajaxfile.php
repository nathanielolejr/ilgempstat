<?php

global $wpdb;
$wpdb = new wpdb( 'u891437076_test_user', 'Killervortex2', 'u891437076_test_database', 'localhost' );

$result = $wpdb->get_results( "SELECT item_id, perm_employee, temp_employee FROM employstats");

while($row = mysqli_fetch_array($result)){
    $item_id = $row['item_id'];
    $perm_employee = $row['perm_employee'];
    $temp_employee = $row['temp_employee'];

    $return_arr[] = array("item_id" => $item_id,
                    "perm_employee" => $perm_employee,
                    "temp_employee" => $temp_employee);
}

echo json_encode($return_arr);
?>
