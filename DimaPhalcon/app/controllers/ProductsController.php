<?php

class ProductsController extends \Phalcon\Mvc\Controller
{

    public function createTableAction()
    {
        if ($this->request->isAjax() && $this->request->isPost()) {
            $prId = $this->request->getPost('prId');
            $tableContent = $this->request->getPost('tableContent');
            $alwaysInTable = $this->request->getPost('alwaysInTable');
            $product = Products::findFirst($prId);
            if ($product == false) {
                echo "Мы не можем сохранить робота прямо сейчас: \n";
                foreach ($product->getMessages() as $message) {
                    echo $message, "\n";
                }
            } else {
                $product->setTableContent($tableContent)
                        ->setAlwaysInTable($alwaysInTable)
                        ->save();
                $substObj = new Substitution();
                $tabContArr = [];
                $tableRes = '';
                $table = json_decode($tableContent);
                foreach ($table as $key => $val) {
                    foreach ($val as $k => $v) {
                        $tabContArr[$k] = $v;
                    }
                    $tableRes .= $substObj->subHTMLReplace('tableContent.html', $tabContArr);
                    $tabContArr = [];
                }
                $alwaysRes = '';
                $table = json_decode($alwaysInTable);
                foreach ($table as $key => $val) {
                    foreach ($val as $k => $v) {
                        $tabContArr[$k] = $v;
                    }
                    $alwaysRes .= $substObj->subHTMLReplace('alwaysInTable.html', $tabContArr);
                    $tabContArr = [];
                }
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent([$tableRes, $alwaysRes]);

                return $this->response;
            }
        }
    }

    public function changeTableContentAction(){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $prId = $this->request->getPost('prId');
            $tableContent = $this->request->getPost('tableContent');
            $alwaysInTable = $this->request->getPost('alwaysInTable');

            $product = Products::findFirst(array("product_id = '$prId'"));
            if ($product == false) {
                echo "Мы не можем сохранить робота прямо сейчас: \n";
                foreach ($product->getMessages() as $message) {
                    echo $message, "\n";
                }
            } else {
                $product->setTableContent($tableContent)
                        ->setAlwaysInTable($alwaysInTable)
                        ->save();
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent('ok');

                return $this->response;
            }
        } else {
            $this->response->redirect('');
        }
    }
    
    public function addBtnToFormulasHelperAction(){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $newFl = $this->request->getPost('newFl');
            $fh = new FormulasHelper();
            $fh->setName($newFl);
            if ($fh->save() == false) {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent('already');
            } else {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent(true);
            }
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }

    public function removeBtnFromFormulasHelperAction(){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $fhText = $this->request->getPost('fhText');
            $fh = FormulasHelper::findFirst(array("name = '$fhText'"));
            if ($fh->delete() == false) {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent('already');
            } else {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent(true);
            }
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }

    public function addNewFormulaAction(){
        if ($this->request->isAjax() && $this->request->isPost()) {
            $formulas = $this->request->getPost('formulas');
            $prId = $this->request->getPost('prId');
            $pr = Products::findFirst(array("product_id = '$prId'"));
            $pr->setFormulas($formulas);
            if ($pr->save() == false) {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent('already');
            } else {
                $this->response->setContentType('application/json', 'UTF-8');
                $this->response->setJsonContent(true);
            }
            return $this->response;
        } else {
            $this->response->redirect('');
        }
    }

}

