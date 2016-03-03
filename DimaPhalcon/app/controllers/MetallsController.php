<?php

use Phalcon\Db\RawValue;

class MetallsController extends ControllerBase
{
    public function getMetallsTableAction(){
        if ($this->request->isAjax() && $this->request->isGet()) {
            $met = Metalls::find(array(
                "order" => "price ASC"));
            $res = '<tr>
                        <th>Металл</th>
                        <th>Цена</th>
                        <th>Масса</th>
                        <th>Исходящая цена</th>
                        <th>Артикул</th>
                        <th class="editMetallTable"></th>
                    </tr>';
            $names = [];
            $article = [];
            foreach ($met as $val) {
                $res .= '<tr>
                            <td><span class="metallName">' . $val->getName() . '</span></td>
                            <td><span class="metallPrice">'. $val->getPrice() . '</span></td>
                            <td><span class="metallMass">'. $val->getMass() . '</span></td>
                            <td><span class="metallOutPrice">'. $val->getOutPrice() . '</span></td>
                            <td><span class="metallArticle">'. $val->getArticle() . '</span></td>
                            <td class="editMetallTable">
                                <span class="glyphicon glyphicon-pencil triggerMetallPencil" aria-hidden="true" name="'. $val->getId() . '"></span>
                                <span class="glyphicon glyphicon-remove triggerRemoveMetall" aria-hidden="true" name="'. $val->getId() . '"></span>
                            </td>
                        </tr>';
                array_push($names, $val->getName());
                array_push($article, $val->getArticle());
            }
            $resObj = ['names' => $names, 'articles' => $article];
            $this->response->setContentType('application/json', 'UTF-8');
            $this->response->setJsonContent(array('html' => $res, 'metallTableContent' => (object)$resObj));

            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }

    public function getMetallsAction() {
        $this->ajaxGetCheck();
        $metallObj = Metalls::find(array("order" => "price ASC"));
        $metallsArr = [];
        $data = [];
        $names = [];
        $articles = [];
        if ($metallObj) {
            foreach ($metallObj as $met) {
                array_push($metallsArr, [
                    'id'        => $met->getId(),
                    'name'      => $met->getName(),
                    'price'     => $met->getPrice(),
                    'mass'      => $met->getMass(),
                    'out_price' => $met->getOutPrice(),
                    'article'   => $met->getArticle()
                ]);
                array_push($names, $met->getName());
                array_push($articles, $met->getArticle());
                $data[$met->getId()] = ['name' => $met->getName(), 'article' => $met->getArticle()];
            }
            $resObj = [
                'names'    => $names,
                'articles' => $articles,
                'data'     => $data
            ];
        }
        $this->response->setJsonContent(['metalls' => $metallsArr, 'metallTableContent' => $resObj]);
        return $this->response;
    }

    public function addMetallToTableAction(){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $name = $this->request->getPost('metall');
            $price = $this->request->getPost('price');
            $mass = $this->request->getPost('mass');
            $outPrice = $this->request->getPost('outPrice');
            $article = $this->request->getPost('article');

            $this->response->setContentType('application/json', 'UTF-8');

            $checkArticle = Metalls::findFirst("article = '" . $article . "'");
            if ($checkArticle) {
                $this->response->setJsonContent('already');
                return $this->response;
            }
            $metalls = new Metalls();
            $metalls->setName($name)
                    ->setPrice($price)
                    ->setMass($mass)
                    ->setOutPrice($outPrice)
                    ->setArticle($article);
            if ($metalls->save() == false) {
                $this->response->setJsonContent('already');
            } else {
                $this->addToMetallHistory($metalls->getId(), $metalls->getPrice(), $metalls->getOutPrice());
                $this->response->setJsonContent(TRUE);
            }
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }
    
    public function editMetallAction() {
        if ($this->request->isAjax() && $this->request->isPost()) {
            $metallId = $this->request->getPost('metallId');
            $metallName = $this->request->getPost('metallName');
            $metallPrice = $this->request->getPost('metallPrice');
            $metallMass = $this->request->getPost('metallMass');
            $metallOutPrice = $this->request->getPost('metallOutPrice');

            $this->response->setContentType('application/json', 'UTF-8');

            $metallQ = Metalls::findFirst($metallId);
            if ($metallQ == false) {
                echo "Мы не можем сохранить робота прямо сейчас: \n";
                foreach ($metallQ->getMessages() as $message) {
                    echo $message, "\n";
                }
            } else {
                $metallQ->setName($metallName)
                         ->setPrice($metallPrice)
                         ->setMass($metallMass)
                         ->setOutPrice($metallOutPrice);
                if ($metallQ->save() == false) {
                    $this->response->setJsonContent('already');
                } else {
                    $this->addToMetallHistory($metallId, $metallPrice, $metallOutPrice);
                    $this->response->setJsonContent(true);
                }

                return $this->response;
            }
        } else {
            $this->response->redirect('');
        }
    }

    public function getMetallsListAction() {
        if ($this->request->isAjax() && $this->request->isGet()) {
            $prId = $this->request->get('prId');
            $product = Products::findFirst($prId);
            if ($product == false) {
                echo "Мы не можем сохранить робота прямо сейчас: \n";
                foreach ($product->getMessages() as $message) {
                    echo $message, "\n";
                }
            } else {
                $productMetall = $product->getMetall();
                $metallsList = $this->createMetallsList($productMetall);
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent($metallsList);
                return $this->response;
            }
        } else {
            $this->response->redirect('');
        }
    }

    public function removeMetallAction (){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $metallId = $this->request->getPost('metallId');
            $this->response->setContentType('application/json', 'UTF-8');
            $res = false;
            $metall = Metalls::findFirst($metallId);
            $metallHistory = MetallPricesHistory::find(array("metall_id = '$metallId'"));
            $metallHistory->delete();
            if ($metall != false && $metallHistory && $metallHistory->delete() && $metall->delete()) {
                $res = true;
            }
            $this->response->setJsonContent($res);
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }

    public function getMetallHistoryAction($id){
        $this->ajaxGetCheck();
        $this->response->setJsonContent($this->buildMetallHistoryObj($id));

        return $this->response;
    }

    public function buildMetallHistoryObj($id)
    {
        $res = [];
        $history = MetallPricesHistory::find(array("metall_id = '$id'"));
        if ($history) {
            foreach ($history as $val) {
                array_push($res, [
                    'price' => $val->getPrice(),
                    'outPrice' => $val->getOutPrice(),
                    'date' => $val->getDate()
                ]);
            }
        }

        return $res;
    }
    
    public function createMetallsList ($productMetall, $isArticle = false) {
        $metallsList = '';
        $article = '';
        $metalls = Metalls::find(array(
            "order" => "name ASC"));
        foreach ($metalls as $val) {
            if ($isArticle) {
               if ($productMetall === $val->getId()) {
                    $metallsList = $val->getName().': '.$val->getPrice();
                    $article = $val->getArticle();
                } 
            } else {
                if ($productMetall === $val->getId()) {
                    $metallsList .= '<option selected="selected" ';
                    $article = $val->getArticle();
                } else {
                    $metallsList .= '<option ';
                }
                $metallsList .= 'name="' . $val->getId()
                    .'" metall="' . $val->getPrice()
                    .'" metallOut="' . $val->getOutPrice()
                    . '" article="' . $val->getArticle()
                    .'">'.
                    $val->getName().': '.$val->getPrice().' грн</option>';
            }
        }
        return ['html' => $metallsList, 'article' => $article];
    }

    private function addToMetallHistory($id, $price, $outPrice) {
        $history = MetallPricesHistory::findFirst(
            "price = '" . $price . "' AND out_price = '" . $outPrice . "' AND metall_id = '" . $id . "'"
        );
        if ($history) {
            $history->setDate(new RawValue('default'))->save();
        } else {
            $historyObj = new MetallPricesHistory();
            $historyObj
                ->setPrice($price)
                ->setOutPrice($outPrice)
                ->setDate(new RawValue('default'))
                ->setMetallId($id)
                ->save();
        }
    }

    public function getMetallHistory($id) {
        $history = MetallPricesHistory::find(array("metall_id = '$id'"));
        $res = '<select id="metallHistorySelect">';
        foreach ($history as $val) {
            $res .= '<option data-price="' . $val->getPrice() . '" data-outprice="' . $val->getOutPrice() . '">' . $val->getDate() . ' | ' . $val->getPrice() . '-' . $val->getOutPrice() .'</option>';
        }
        $res .= '</select>';
        return $res;
    }
} 