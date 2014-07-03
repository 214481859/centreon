<?php

/*
 * Copyright 2005-2014 MERETHIS
 * Centreon is developped by : Julien Mathis and Romain Le Merlus under
 * GPL Licence 2.0.
 * 
 * This program is free software; you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation ; either version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with 
 * this program; if not, see <http://www.gnu.org/licenses>.
 * 
 * Linking this program statically or dynamically with other modules is making a 
 * combined work based on this program. Thus, the terms and conditions of the GNU 
 * General Public License cover the whole combination.
 * 
 * As a special exception, the copyright holders of this program give MERETHIS 
 * permission to link this program with independent modules to produce an executable, 
 * regardless of the license terms of these independent modules, and to copy and 
 * distribute the resulting executable under terms of MERETHIS choice, provided that 
 * MERETHIS also meet, for each linked independent module, the terms  and conditions 
 * of the license of that module. An independent module is a module which is not 
 * derived from this program. If you modify this program, you may extend this 
 * exception to your version of the program, but you are not obliged to do so. If you
 * do not wish to do so, delete this exception statement from your version.
 * 
 * For more information : contact@centreon.com
 * 
 */

namespace CentreonBam\Controllers;

class BusinessActivityController extends \CentreonConfiguration\Controllers\ObjectAbstract
{
    protected $objectDisplayName = 'Businessactivity';
    protected $objectName = 'businessactivity';
    protected $objectBaseUrl = '/bam/business-activity';
    protected $objectClass = '\CentreonBam\Models\Businessactivity';
    
    public static $moduleName = 'CentreonBam';
    public static $relationMap = array();
    
    /**
     * 
     * @method get
     * @route /bam/business-activity
     */
    public function listAction()
    {
        parent::listAction();
    }
    
    /**
     * 
     * @method get
     * @route /bam/business-activity/list
     */
    public function datatableAction()
    {
        parent::datatableAction();
    }
    
    /**
     * 
     * @method get
     * @route /bam/business-activity/formlist
     */
    public function formListAction()
    {
        parent::formListAction();
    }
    
    /**
     * Create a new business activity
     *
     * @method post
     * @route /bam/business-activity/add
     */
    public function createAction()
    {
        parent::createAction();
    }
    
    /**
     * Update a business activity
     *
     *
     * @method post
     * @route /bam/business-activity/update
     */
    public function updateAction()
    {
        parent::updateAction();
    }
    
    /**
     * Add a business activity
     *
     * @method get
     * @route /bam/business-activity/add
     */
    public function addAction()
    {
        $tpl = \Centreon\Internal\Di::getDefault()->get('template');
        $tpl->assign('validateUrl', '/bam/business-activity/add');
        parent::addAction();
    }
    
    /**
     * Update a business activity
     *
     * @method get
     * @route /bam/business-activity/[i:id]
     */
    public function editAction()
    {
        parent::editAction();
    }
    
    /**
     * Duplicate a business activity
     *
     * @method post
     * @route /bam/business-activity/duplicate
     */
    public function duplicateAction()
    {
        parent::duplicateAction();
    }

    /**
     * Apply massive change
     *
     * @method POST
     * @route /bam/business-activity/massive_change
     */
    public function massiveChangeAction()
    {
        parent::massiveChangeAction();
    }
    
    /**
     * Get the list of massive change fields
     *
     * @method get
     * @route /bam/business-activity/mc_fields
     */
    public function getMassiveChangeFieldsAction()
    {
        parent::getMassiveChangeFieldsAction();
    }

    /**
     * Get the html of attribute filed
     *
     * @method get
     * @route /bam/business-activity/mc_fields/[i:id]
     */
    public function getMcFieldAction()
    {
        parent::getMcFieldAction();
    }

    /**
     * Delete action for business activity
     *
     * @method post
     * @route /bam/business-activity/delete
     */
    public function deleteAction()
    {
        parent::deleteAction();
    }
}
