## TO DO
[]  Create Order Form when userType = "CUSTOMER" : 
   [] customer select should be hidden, and customerId value automatically prefilled with server side verification.
   [] Should not be able to modify order status

[] Create Order Form - Item Select combobox: search by item name not itemId
[] Order Details - On Edit: implement item select
[] implement url state to determine which order details to display
[] Connect pagination controls to getOrdersQuery
[] item page- clicking on a row in items table should reveal a itemdetails section similar to orders. it should show item information as well as stockmovement history.
[] Update icons on the orderdetails based on values, ex; IN OUT arrows.

[] Fix Item table search- currently only searches current table page. should search all pages.

[] Item Stock x Order - Logic Flaw: If a Completed Order movement Type is changed then the status is updated to not completed and back to completed this results in stock movement being created with conflicting movements. 
   Example:
      Consider the following scenario:
         Order A movement type is IN
         Order A has Item X with a quantity of 10.
         Order A status is PENDING
         Item X current stock is 0.

      1- Update Order A status to COMPLETED.
         - Stock Movement is created with movementType IN and quantity of 10.
         - Item X current stock = 10.
      
      2- Edit Order A movement type to Out and status to Pending.
         - Status Update triggers stock movement reversal:
            -Stock Movement reversal is logged based on new order details.
            Therefore the stock movement reversal log will be logged as the opposite of new movementType. OUT becomes IN. 
         - New Item X stock = 20. while in reality it should be 0.

            

