<?php

class MenuController extends \Phalcon\Mvc\Controller
{
    public function createFileManagerAction(){
        if ($this->request->isAjax() && $this->request->isGet()) {
            $this->response->setContentType('application/json', 'UTF-8');
            $param = $this->request->get('param');
            if ('PR' === $param) {
                $products = $this->getProducts();
            } else {
                $orders = $this->getOrders();
                $products['orders'] = $orders['ordersTable'];
                $products['orderDescription'] = $orders['orderDescription'];
            }
            $this->response->setJsonContent($products);

            return $this->response;
        } else {
            $this->response->redirect();
        }
    }

    private function getProducts() {
        $products = Products::find(array("status = 'save'"));
        if ($products == false) {
            echo "Мы не можем сохранить робота прямо сейчас: \n";
            foreach ($products->getMessages() as $message) {
                echo $message, "\n";
            }
            return false;
        }
        $productsTable = '<tr>
                            <th>Категория</th>
                            <th>Металл</th>
                            <th>Название</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
                          </tr>';
        $substObj = new Substitution();

        $categoriesObj = new CategoriesController;
        $categoriesRes = $categoriesObj->createCategoriesList();
        $categoriesList = '<option name="categoriesAll" selected="selected">Все</option>';
        $categoriesList .= $categoriesRes['html'];
        $categoriesArr = $categoriesRes['categoriesArr'];
        foreach ($products as $val) {
            $arr['%NAME%'] = $val->getProductName();
            $arr['%CATEGORY%'] = $categoriesArr[$val->getCategoryId()];
            $arr['%CATEGORY_ID%'] = $val->getCategoryId();
            $arr['%CREATED%'] = $val->getCreated();
            $arr['%ACTIONS%'] = '';
            $productID = $val->getProductId();
            $metallId = $val->getMetall();
            $prInOrderObj = Productinorder::find(array("productId = '$productID'"));
            $metallObj = Metalls::findFirst($metallId);
            $arr['%METALL%'] = $metallObj->getName();
            foreach ($prInOrderObj as $data) {
                $orderId = $data->getOrderId();
                $prObj = Orders::findFirst(array("id = '$orderId'"));
                if (!empty($arr['%ORDERS%'])) {
                    $arr['%ORDERS%'] .= ', ';
                }
                $arr['%ORDERS%'] .= $prObj->getArticle();
            }
            $tabsObj = Tabs::findFirst(array("product_id = '$productID'"));
            if (!$tabsObj) {
                $arr['%ACTIONS%'] = '<span class="glyphicon glyphicon-eye-open openProductTab" data-id="' . $productID . '" data-type="product" aria-hidden="true" data-selected=""></span>';
            }
            $productsTable .= $substObj->subHTMLReplace('menuProductTableRow.html', $arr);
        }
        return array('categories' => $categoriesList, 'products' => $productsTable);
    }

    private function getOrders(){
        $orders = Orders::find(array("status = 'save'"));
        if ($orders == false) {
            echo "Мы не можем сохранить робота прямо сейчас: \n";
            foreach ($orders->getMessages() as $message) {
                echo $message, "\n";
            }
            return false;
        }
        $ordersTable = '<tr>
                            <th>Название проэкта</th>
                            <th>Название компании</th>
                            <th>Артикул</th>
                            <th>Город</th>
                            <th>Действия</th>
                        </tr>';
        $substObj = new Substitution();
        $orderObj = new OrderController();
        $orderDescription = $orderObj->getOrderDescriptionObj();
        foreach ($orders as $val) {
            $arr['%FULL_INFO%'] = [];
            foreach (json_decode($val->getOrderDescription()) as $key => $text) {
                $arr[$key] = $text;
                if (trim($text)) {
                    array_push($arr['%FULL_INFO%'], '"' . str_replace("%", "", $key) . '": "' . $text . '"');
                }
            }
            array_push($arr['%FULL_INFO%'], '"ORDER_NAME": "' . $val->getArticle() . '"');
            $arr['%NAME%'] = $val->getArticle();
            $orderId = $val->getId();
            $arr['%PRODUCTS%'] = '<table class="table table-bordered">';
            $arr['%ACTIONS%'] = '';
            $arr['%FULL_INFO%'] = implode(",", $arr['%FULL_INFO%']);
            $products = Productinorder::find(array("orderId = '$orderId'"));
            foreach ($products as $data) {
                $productId = $data->getProductId();
                $prObj = Products::findFirst(array("product_id = '$productId'"));
                $arr['%PRODUCTS%'] .= '<tr><td>' . $prObj->getArticle() . '</td><td>' . $prObj->getProductName() . '</td></tr>';
            }
            $arr['%PRODUCTS%'] .= '</table>';
            $orderTabsObj = TabsRight::findFirst(array("order_id = '$orderId'"));
            if (!$orderTabsObj) {
                $arr['%ACTIONS%'] = '<span class="glyphicon glyphicon-eye-open openProductTab"'
                        . ' data-id="' . $orderId . '" data-type="order" aria-hidden="true" data-selected="">'
                        . '</span><span class="glyphicon glyphicon-list-alt consolidateOrder" aria-hidden="true" data-id="' . $orderId . '" data-selected=""></span>';
            } else {
                $arr['%ACTIONS%'] .= '<span class="glyphicon glyphicon-search emptyGlyphSpan" aria-hidden="true"></span><span class="glyphicon glyphicon-list-alt consolidateOrder" aria-hidden="true" data-id="' . $orderId . '" data-selected=""></span>';
            }
            $ordersTable .= $substObj->subHTMLReplace('menuOrderTableRow.html', $arr);
        }

        return ['ordersTable' => $ordersTable, 'orderDescription' => $orderDescription];
    }

    public function saveOrderMapAction(){
            if ($this->request->isAjax() && $this->request->isPost()) {
                $map = $this->request->getPost('map');
                $orderId = $this->request->getPost('orderId');
                $this->response->setContentType('application/json', 'UTF-8');
                $order = Orders::findFirst(array("id = '$orderId'"));
                if ($order == false) {
                    echo "Мы не можем сохранить робота прямо сейчас: \n";
                    foreach ($order->getMessages() as $message) {
                        echo $message, "\n";
                    }
                } else {
                    $order->setMap($map);
                    if($order->save()) {
                        $this->response->setJsonContent(true);

                        return $this->response;
                    }

                }
            } else {
                $this->response->redirect('');
            }
    }

    public function getClientsTreeAction () {
        if ($this->request->isAjax() && $this->request->isGet()) {
            $this->response->setContentType('application/json', 'UTF-8');
            $tree = [];
            $clientObj = Clients::find();
            if (count($clientObj)) {
                foreach ($clientObj as $val) {
                    /*foreach ($val->Projects as $key) {

                        var_dump($key->getName());
                        die();
                    }*/

                    $clientId = $val->getId();
                    $node = [
                        'label'    => $val->getFio() . ' | ' . $val->getCompanyName(),
                        'id'       => $clientId,
                        'sector'   => 'client',
                        'children' => []
                    ];
                    $projectObj = Projects::find();
                    if (count($projectObj)) {
                        foreach ($projectObj as $prVal) {
                            $projectId = $prVal->getId();
                            $node2 = [
                                'label'    => $prVal->getName(),
                                'id'       => $projectId,
                                'sector'   => 'project',
                                'children' => []
                            ];
                            $ordersObj = Orders::find(
                                "project = '" . $projectId . "' AND status = 'save' AND consolidate != 'TRUE'"
                            );
                            if (count($ordersObj)) {
                                foreach ($ordersObj as $orVal) {
                                    $child = [
                                        'label'  => $orVal->getArticle(),
                                        'sector' => 'order',
                                        'id'     => $orVal->getId()
                                    ];
                                    array_push($node2['children'], (object)$child);
                                }
                            }
                            if (count($node2['children'])) {
                                array_push($node['children'], (object)$node2);
                            }
                        }
                    }
                    if (count($node['children'])) {
                        array_push($tree, (object)$node);
                    }
                }
            }
            $this->response->setJsonContent($tree);
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }
}