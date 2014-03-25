using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TopContracts10.ViewModels;
using TopContractsCommon10;
using TopContractsDAL10;
using TopContractsDAL10.SystemTables;
using TopContractsBL10;
using System.IO;
using TopContractsCommon10.Diagnostics;
using TopContracts10.Infrastructure;
using TopContractsDAL10.DasboardTables;
using System.Web.Script.Serialization;
using TopContractBLBase;

namespace TopContracts10.Controllers
{
    [RequireHTTP]
    public class AdminController : ControllerWithSysTables
    {
        public ActionResult ViewMode(string SystemTableName)
        {
            try
            {
                //eContractsMailer.EmailSender.Send("asd@sad.com", "asd", "asd", "asd@asdasdasd.com");
                //TopContractsCommon10.Mail.EmailSender.Send("asd@sad.com", "asd", "asd", "asd@asdasdasd.com");

                if (SystemTableName == null)
                    SystemTableName = SysTables.UserPrefs.ToString();

                if (this.PreferencesInSession == null)
                    this.PreferencesInSession = new Preferences(HttpContext);

                this.PreferencesInSession.SystemTableName = SystemTableName;
            }
            catch
            {
                //No use of catching errors in this initialization process. It is handled in the GetData() section
            }

            return View(this.PreferencesInSession);
        }

        public ActionResult EntityViewMode(string SystemTableName)
        {
            try
            {
                //eContractsMailer.EmailSender.Send("asd@sad.com", "asd", "asd", "asd@asdasdasd.com");
                //TopContractsCommon10.Mail.EmailSender.Send("asd@sad.com", "asd", "asd", "asd@asdasdasd.com");

                if (SystemTableName == null)
                    SystemTableName = EntityTables.Entities.ToString();

                if (this.PreferencesInSession == null)
                    this.PreferencesInSession = new Preferences(HttpContext);

                this.PreferencesInSession.SystemTableName = SystemTableName;
            }
            catch
            {
                //No use of catching errors in this initialization process. It is handled in the GetData() section
            }

            // Need to be discussed with Boaz
            if (this.PreferencesInSession.InfoPipe.AppLicense.AllowEntities)
                return View(this.PreferencesInSession);
            else
                return RedirectToAction("ViewMode", new { SystemTableName = string.Empty });
        }

        public ActionResult SysAdminListTypeFields()
        {
            string SystemTableName = string.Empty;
            try
            {
                if (SystemTableName == null)
                    SystemTableName = SysTables.Fields.ToString();

                if (this.PreferencesInSession == null)
                    this.PreferencesInSession = new Preferences(HttpContext);

                this.PreferencesInSession.SystemTableName = SystemTableName;
            }
            catch
            {
                //No use of catching errors in this initialization process. It is handled in the GetData() section
            }

            return View(this.PreferencesInSession);
        }


        public ActionResult SysAdminCatalogRecords()
        {
            string SystemTableName = string.Empty;
            try
            {
                SystemTableName = EntityTables.Entities.ToString();

                if (this.PreferencesInSession == null)
                    this.PreferencesInSession = new Preferences(HttpContext);

                this.PreferencesInSession.SystemTableName = SystemTableName;
            }
            catch
            {
                //No use of catching errors in this initialization process. It is handled in the GetData() section
            }

            return View(this.PreferencesInSession);
        }


        [HttpPost]
        public ActionResult GetEntityRecords(long EntityID, bool GetAllRecords)
        {
            try
            {
                List<EntityRecordDtos> entrList = new List<EntityRecordDtos>();
                Preferences pr = this.PreferencesInSession;
                pr.InitEntityRecords(EntityID);
                InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];

                if (GetAllRecords)
                {
                    entrList = EntityRecordDtos.CreateListFromSysTableEntryBase(pr.TableEntries.Cast<ContractType>().ToList(), infoPipe.CultureIdentifier, infoPipe.AppPrefs.OrganizationIdentifier, (int)infoPipe.User.ID);
                }
                else
                {
                    entrList = EntityRecordDtos.CreateCatalogWithEmptyRecord(pr.TableEntries.Cast<ContractType>().ToList(), infoPipe.CultureIdentifier, infoPipe.AppPrefs.OrganizationIdentifier, (int)infoPipe.User.ID);
                }

                //-----Allowing large JSon actionResult!! Boaz, 06-Aug-2013 ---------------
                var serializer = new JavaScriptSerializer();
                serializer.MaxJsonLength = Int32.MaxValue;

                var result = new ContentResult
                {
                    Content = serializer.Serialize(entrList),
                    ContentType = "application/json"
                };
                return result;

                //JsonResult jsonResult = Json(entrList);
                //return jsonResult;


            }
            catch (Exception ex)
            {
                return Json(new ErrorDTO(new ExceptionUnknownAdminRead("Failed getting Catalog Records", ex)));
            }

        }

        [HttpPost]
        public ActionResult GetOrganization()
        {
            try
            {
                Preferences pr = new Preferences(HttpContext); //TODO - change this later to support administration of sys table
                pr.InitOrganization(true);

                List<UnitDto> lstUnits = UnitDto.CreateListFromUnits(pr.TableEntries.Cast<Unit>().ToList());
                //List<UnitDto> lstUnits = pr.sysTablesManager.Entries.Cast<UnitDto>().ToList();
                return Json(lstUnits);
            }
            catch (Exception ex)
            {
                return Json(new ErrorDTO(new ExceptionUnknownAdminRead("Failed getting Organization", ex)));
            }

        }

        /// <summary>
        /// For testing purposes only
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public ActionResult AbandonSession()
        {
            Session.Abandon();
            return null;
        }


        //Arkady
        [HttpPost]
        public ActionResult GetGuid()
        {
            return Json(Guid.NewGuid());
        }
        //Arkady

        [HttpPost]
        public ActionResult SaveOrganization(List<UnitDto> units)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                if (pr == null)
                    pr = this.PreferencesInSession = new Preferences(HttpContext);

                if (pr.sysTablesManager == null)
                    pr.sysTablesManager = new SysTableCommonManager();

                pr.InitOrganization(true);
                pr.TableEntries = Unit.GetListFromDto(units);
                pr.SaveSysTable();
                //pr.sysTablesManager.Entries = Unit.GetListFromDto(units);
                //pr.SaveSysTable();
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave("Failed Saving Organization", ex)));
            }
        }

        [HttpPost]//Arkady
        public ActionResult SysTableSave(List<SysTableEntryBaseDto> sysTableDto, string tableName)
        {
            string sysTableName = "";
            try
            {
                //throw new ExceptionDataContractReadNoSuchContract();
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(tableName, pr);
                sysTableName = pr.SystemTableName;

                SysTables sysTable = (SysTables)Enum.Parse(typeof(SysTables), pr.SystemTableName);
                switch (sysTable)
                {
                    case SysTables.ContractTypes:
                        pr.SaveSysTable(ContractType.GetListFromDto(sysTableDto));
                        break;
                    case SysTables.EventTypes:
                        pr.SaveSysTable(EventType.GetListFromDto(sysTableDto));
                        break;
                    case SysTables.Statuses:
                        pr.SaveSysTable(Status.GetListFromDto(sysTableDto));
                        break;
                }

            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = false; //(msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_Contracts_ContractTypes"));
                            //if (errDelete)
                            //    return Json(new ErrorDTO(new ExceptionDataAdminSaveDelSysEntryLinkedContract("Table being changed: " + sysTableName)));
                            errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_FieldGroupsContractTypesMAP_ContractTypes"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelContractTypeOfFieldGroup()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
            return null;
        }

        [HttpPost]
        public ActionResult MsgTypesSave(List<MsgTypeDto> msgTypeDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.MsgTypes.ToString(), pr);
                pr.SaveSysTable(MsgType.GetListFromDto(msgTypeDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult CncyRatesSave(List<CurrencyRateDto> CncyRatesDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.CurrencyRates.ToString(), pr);
                pr.SaveSysTable(CurrencyRate.GetListFromDto(CncyRatesDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult CurrenciesSave(List<CurrencyDto> systable)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.Currencies.ToString(), pr);
                pr.SaveSysTable(Currency.GetListFromDto(systable));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_Contracts_Currencies"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelCurrencyEntryLinkedContract()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult RolesSave(List<RoleDto> RoleDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.Roles.ToString(), pr);
                pr.SaveSysTable(Role.GetListFromDto(RoleDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                {
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && (msgToCheck.Contains("FK_ContractUsers_Roles") || msgToCheck.Contains("FK_Users_Roles")));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelRoleWithUser()));
                        }
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
                }
            }
        }

        [HttpPost]
        public ActionResult UsersSave(List<UserDto> UserDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.Users.ToString(), pr);
                pr.SaveSysTable(TopContractsDAL10.SystemTables.User.GetListFromDto(UserDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_ContractUsers_Users"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelUserLinkedContract()));

                            errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_TodoRecipients_Users"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelUserLinkedContract()));

                            errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_ContractActivities_Users"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelUserLinkedContractActivities()));

                            errDelete = (msgToCheck.Contains("Saving dataSequence contains no matching element"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataContractSaveDelUserOtherLoggedUser()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult FieldGroupsSave(List<FieldGroupDto> sysTableDto)
        {
            try
            {

                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.Fields.ToString(), pr);
                if (this.PreferencesInSession != null)
                    pr.InitSystemTable(SysTables.Fields.ToString(), false, false);

                pr.TableEntries = TopContractsDAL10.SystemTables.FieldGroup.GetListFromDto(sysTableDto);
                InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
                pr.SaveSysTableCascadeDelete(infoPipe);

                //HttpContext.Application.Remove("ApplicationsCache");
                //TopContractsBL10.ContractManager.ClearCachedData();
                //Session.Abandon();
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_ContractFieldGroups_FieldGroups"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelSysEntryLinkedContract()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        //[HttpPost]
        //public ActionResult FieldsSave(List<FieldDto> sysTableDto)
        //{
        //    return null;
        //}
        //[HttpPost]
        //public ActionResult AppPrefsInfo()
        //{
        //    return Json(PreferencesInSession.sysTablesManager.AppPrefs);
        //}

        [HttpPost]
        public ActionResult AppPrefsSave(AppPrefsDto appPrefsDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.AppPrefs.ToString(), pr);
                InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
                pr.SaveAppPrefs(infoPipe, appPrefsDto);
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }

        }

        //[HttpPost]
        //public ActionResult AppPrefsSave(Test test)
        //{
        //    return null;
        //}

        [HttpPost]
        public ActionResult UserPrefsSave(User userPrefs)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.AppPrefs.ToString(), pr);
                pr.SaveUserPrefs(userPrefs);

                //Session.Abandon(); //For refresh purposes
                RefreshInfoPipe();
                this.PreferencesInSession = new Preferences(HttpContext);
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }

        }
        //Arkady
        /// <summary>
        /// method to save reportsInfo
        /// </summary>
        /// <param action="sysTableDto">table of ReportsInfo data we get from client</param>
        /// <returns>null in case of success or jason in case of failure</returns>
        [HttpPost]
        public ActionResult ReportsInfoSave(List<ReportsInfoDto> sysTableDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.ReportsInfo.ToString(), pr);
                pr.SaveSysTable(ReportsInfo.getListFromDto(sysTableDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }
        //Arkady - end

        /// <summary>
        /// To save/edit a linked application.
        /// </summary>
        /// <param action="sysTableDto">containing detail of the application to be saved/edited</param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult AppLinksSave(List<ApplicationDto> sysTableDto)
        {
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.Applications.ToString(), pr);
                if (this.PreferencesInSession != null)
                    pr.InitSystemTable(SysTables.Applications.ToString(), false, false);
                pr.SaveSysTable(Application.GetListFromDto(sysTableDto));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                {
                    Logger.Write(LogCategory.Exception, "AppLinksSave method of AdminController",
                          string.Format("Error caught: {0}", Logger.GetErrorsText(ex)),
                          System.Diagnostics.TraceEventType.Warning);
                    return Json(new ErrorDTO(ex as ExceptionExtended));
                }
                else
                {
                    Logger.Write(LogCategory.Exception, "AppLinksSave method of AdminController",
                        string.Format("Error occured: {0}", Logger.GetErrorsText(ex)),
                        System.Diagnostics.TraceEventType.Error);
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave("Failed to save application.", ex)));
                }

            }
        }

        //[HttpPost]
        //public ActionResult ActivateTriggerJob()
        //{
        //    //TextWriter tw = new StreamWriter("D:\\Sample.txt", true);
        //    //tw.WriteLine("Inside Trigger() method: " + DateTime.Now.ToString());
        //    //tw.Close();
        //    return null;
        //}

        /// <summary>
        /// ActivateAlertsExtensionsJob method
        /// </summary>
        /// <param action="input">input as string</param>
        /// <returns>ActionResult</returns>
        [HttpPost]
        public ActionResult ActivateAlertsExtensionsJob(string input)
        {
            //This is to circumvent a problem in the action sent from the form... Needs to be fixed...
            input = input.Substring(1, input.IndexOf("_") - 1);

            //JobsServiceManager jsm = new JobsServiceManager();
            TopContractsCore.AlerterJobsService jobService = new TopContractsCore.AlerterJobsService();
            InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
            jobService.ActivateAlerter(infoPipe.AppPrefs.OrganizationIdentifier, new Guid(input));
            return null;
        }

        [HttpPost]
        public ActionResult ActivateAlerterJob()
        {
            TopContractsCore.AlerterJobsService jsm = new TopContractsCore.AlerterJobsService();
            InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
            jsm.ActivateAlerter(infoPipe.AppPrefs.OrganizationIdentifier);
            return null;
        }

        [HttpPost]
        public ActionResult PollAlerterJob()
        {
            //JobsServiceManager jsm = new JobsServiceManager();
            TopContractsCore.AlerterJobsService jobService = new TopContractsCore.AlerterJobsService();
            InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
            long stid = jobService.PollAlerter(infoPipe.AppPrefs.OrganizationIdentifier);
            if (stid < 0)
            {
                System.Threading.Thread.Sleep(5000);
                RefreshInfoPipe();
                return null;
            }

            return Json(stid);
        }

        [HttpPost]
        public ActionResult ChangeApiPassword(string currentPassword, string newPassword, string confirmPassword)
        {
            try
            {
                if (newPassword != confirmPassword)
                    throw new ExceptionDataAdminSaveConfirmPasswordDontMatch();

                License license = new License();
                Preferences pr = this.PreferencesInSession;

                license.ChangeApiPassword(currentPassword, newPassword, pr.InfoPipe.AppPrefs);
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        private void RefreshInfoPipe()
        {
            ((InfoPipe)Session["InfoPipe"]).Refresh();
        }

        private void ClearSession()
        {
            Session.Clear();
        }

        //private PreferencesInSession PreferencesInSession
        //{
        //    get
        //    {
        //        return (PreferencesInSession)HttpContext.Session["PreferencesInSession"];
        //    }
        //    set
        //    {
        //        HttpContext.Session["PreferencesInSession"] = value;
        //    }
        //}

        /// <summary>
        /// Checks mapping of either a field group, a field or a contract type with the contract data.
        /// </summary>
        /// <param action="ItemID">A FieldGroupID or FieldID whose association is required to be checked.</param>
        /// <param action="MappingType">Type of mapping. Value can be 
        /// 1. FieldMapping - To check mapping of a field, 
        /// 2. FieldGroupMapping - To check mapping of a field group, 
        /// 3. FieldGroupContractTypeMapping - To check mapping of a field group with a contract type.</param>
        /// <param action="ContractTypeID">Id of the contract type. Only required when mapping of a field group 
        /// with a contract type is required to be changed.</param>
        /// <returns></returns>
        public JsonResult CheckFieldAssociationWithContract(long ItemID, string MappingType, long ContractTypeID)
        {
            return Json(new SysTableCommonManager().CheckFieldsMappingWithContract(ItemID, MappingType, ContractTypeID));
        }

        public JsonResult GetSysTableValues(string SysTableName)
        {
            SysTableCommonManager sysTableManager = new SysTableCommonManager();
            return Json(sysTableManager.GetSystemTable(SysTableName, (InfoPipe)HttpContext.Session["InfoPipe"], true, true));
        }

        private Preferences InitPreferences(string tableName, Preferences pr)
        {
            if (pr == null)
            {
                pr = new Preferences(HttpContext);
                pr.SystemTableName = tableName;
                pr.InitSystemTable(tableName, false, false);
            }
            return pr;
        }

        private Preferences InitEntityPreferences(string tableName, Preferences pr)
        {
            if (pr == null)
            {
                pr = new Preferences(HttpContext);
                pr.EntityTableName = tableName;
                pr.InitEntityTable(tableName, false, false);
            }
            return pr;
        }

        [HttpPost]
        public ActionResult EntitiesSave(List<EntitiesDto> entityTableDto)
        {
            try
            {
                TopContractsBL10.ContractManager.ClearCachedData();
                List<SysTableEntryBaseDto> entitytable = entityTableDto.Cast<SysTableEntryBaseDto>().ToList();
                Preferences pr = this.PreferencesInSession;
                pr = InitEntityPreferences(EntityTables.Entities.ToString(), pr);
                // delete Contracts and records delete from contracts related tables when deleted any entity--added by deepak dhamija (28/02/2013)               
                //bool saveEntitystatus = true;
                //bool saveEntitystatus: Used for if Linked Entity ID exist then It will not delete Entity records,fields and entity.and manitain saveEntitystatus=false
                //And pr.SaveEntityTable(ContractType.GetListFromDto(entitytable)) used for many purposes e.g (save and delete)
                //If saveEntitystatus=false then It will not delete from  the maps,Cotract type etc.
                //foreach (var entities in entitytable)
                //{
                //    if (entities.Deleted)
                //    {
                //        //Check Contract Type ID is linkedEntityID(One Contract contain the entity field type)
                //        //If Exists then that entity can not be deleted.If Linked not exists then Deleted the contracts one by one
                //        var FieldDetailExist = Field.GetFieldByLinkedID(Convert.ToInt64(entities.ID));
                //        if (FieldDetailExist == null)
                //        {
                //            var ContractDetail = Contract.getContractsbyContractTypeID(Convert.ToInt64(entities.ID));
                //            foreach (long ContractID in ContractDetail)
                //            {
                //                //Get the Contracts with Contract type ID.If exist contacts then delete one by one. 
                //                ContractManager.DeleteContract(ContractID, (InfoPipe)HttpContext.Session["InfoPipe"]);
                //            }
                //        }
                //        else
                //        {
                //            saveEntitystatus = false;
                //        }
                //    }
                //}
                //if (saveEntitystatus)
                //{
                pr.SaveEntityTable(ContractType.GetListFromDto(entitytable));
                //}
                //else
                //{
                //    throw new ExceptionDataEntityMapsField();
                //}
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult EntityGroupsSave(List<FieldGroupDto> entityFieldsTableDto, List<EntitiesDto> entityTableDto)
        {
            try
            {
                //TopContractsBL10.ContractManager.ClearCachedData();
                Preferences pr = this.PreferencesInSession;
                pr = InitEntityPreferences(EntityTables.EntityFields.ToString(), pr);
                if (this.PreferencesInSession != null)
                    pr.InitEntityTable(EntityTables.EntityFields.ToString(), false, false);

                pr.TableEntries = TopContractsDAL10.SystemTables.FieldGroup.GetListFromDto(entityFieldsTableDto);
                //InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
                //pr.SaveEntityTable(pr.TableEntries);
                pr.SaveEntityFieldsWithEntities(pr.TableEntries, entityTableDto);
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_ContractFieldGroups_FieldGroups"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelSysEntryLinkedContract()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }


        [HttpPost]
        public ActionResult CreateContractForEntityRecord(string ContractName, int ContractTypeID, int ContractStatusID)
        {
            try
            {
                long result = -1;
                result = ContractManager.CreateContract((InfoPipe)HttpContext.Session["InfoPipe"], ContractName, ContractTypeID, ContractStatusID);
                JsonResult ent = Json(entityTableGet(EntityTables.EntityRecords.ToString(), true, true));
                return ent;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    return Json(new ErrorDTO(new ExceptionUnknownContractSave(ex)));
            }
        }

        [HttpPost]
        public ActionResult EntityRecordsSave(List<EntityRecordDtos> entityRecordsTableDto)
        {
            try
            {
                bool catalogsChanged = false;
                InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
                foreach (EntityRecordDtos entityRecords in entityRecordsTableDto)
                {
                    foreach (Contract contract in entityRecords.Records)
                    {
                        if (contract.ID < 0)
                        {
                            contract.ID = ContractManager.CreateEntityRecord((InfoPipe)HttpContext.Session["InfoPipe"], "", (int)contract.Properties.ContractTypeID, contract.Properties.StatusID);
                            contract.New = false;
                        }
                        ContractManager.SaveContractforEntity(contract, infoPipe);
                    }

                    if (entityRecords.Records.Count() > 0)
                        catalogsChanged = true;
                }

                if (catalogsChanged)
                    ApplicationCachedData.UpdateContractDisplayCacheTicks();

                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("DELETE statement conflicted") && msgToCheck.Contains("FK_ContractFieldGroups_FieldGroups"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveDelSysEntryLinkedContract()));

                            errDelete = (msgToCheck.Contains("Object reference not set to an instance of an object"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataAdminSaveSessionOut()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        //[HttpPost]
        //public ActionResult GetFieldGroupsMappedWithContractType(long fieldGroupId)
        //{

        //}

        public ActionResult GetAllEntities()
        {
            InfoPipe infoPipe = (InfoPipe)HttpContext.Session["InfoPipe"];
            try
            {
                List<SysTableEntryBaseOfBase> EntityListItems = new SysTableCommonManager().GetEntityTable(EntityTables.Entities, infoPipe, true, true);
                List<EntitiesDto> lstEntities = EntitiesDto.CreateListFromSysTableEntryBase(EntityListItems.Cast<ContractType>().ToList());
                return Json(lstEntities);
            }
            catch (Exception)
            {

                throw;
            }

        }
        public JsonResult GetFieldDetailbyFieldID(long FieldID)
        {
            return Json(Field.GetFieldByID(FieldID));
        }

        [HttpPost]
        public ActionResult SavedSearches(List<SaveSearchDtos> SavedSearch)
        {
            if (SavedSearch == null)
                return null;
            try
            {
                Preferences pr = this.PreferencesInSession;
                pr = InitPreferences(SysTables.SavedSearches.ToString(), pr);
                if (SavedSearch.Count() == 0)
                    return null;
                pr.SaveSysTable(SaveSearch.GetListFromDto(SavedSearch));
                return null;
            }
            catch (Exception ex)
            {
                if (ex is ExceptionExtended)
                    return Json(new ErrorDTO((ex as ExceptionExtended)));
                else
                    if (ex.InnerException != null)
                        if (ex.InnerException.InnerException != null)
                        {
                            string msgToCheck = ex.InnerException.InnerException.Message;
                            bool errDelete = (msgToCheck.Contains("INSERT statement conflicted") && msgToCheck.Contains("FK_SearchResultsContracts_SearchResultsContracts"));
                            if (errDelete)
                                return Json(new ErrorDTO(new ExceptionDataSearchSaveContractToSearchContracts()));
                        }
                return Json(new ErrorDTO(new ExceptionUnknownAdminSave(ex)));
            }
        }

        public ActionResult ValidateDatabase()
        {
            SysTableCommonManager sysTableCommonManager = new SysTableCommonManager();
            return Json(sysTableCommonManager.ValidateDatabase(((InfoPipe)HttpContext.Session["InfoPipe"])));
        }

        [HttpPost]
        public ActionResult GenerateStructure(Catalog CatalogID, List<FieldList> FieldIDs, RecordKeyType RecordKeyType, RecordCompareType RecordCompareType, List<long> RecordKeyFieldIDs, List<long> RecordCompareFieldIDs, bool ForceUpdateWithNoCompare, bool RunAsTransaction)
        {
            CatalogueDefinition catalogueDefinition = new CatalogueDefinition();
            catalogueDefinition.Catalog = CatalogID;
            catalogueDefinition.Fields = FieldIDs;
            catalogueDefinition.RecordKeyType = RecordKeyType;
            catalogueDefinition.RecordCompareType = RecordCompareType;
            catalogueDefinition.RecordKeyFieldIDs = RecordKeyFieldIDs;
            catalogueDefinition.RecordCompareFieldIDs = RecordCompareFieldIDs;
            catalogueDefinition.ForceUpdateWithNoCompare = ForceUpdateWithNoCompare;
            catalogueDefinition.RunAsTransaction = RunAsTransaction;
            string catalogInit = Utils.ConvertCatalogueDefinitionDataToXML(catalogueDefinition);
            return Json(catalogInit);
        }

        [HttpPost]
        public ActionResult SyncCataloguesRecords(string catDefinition, string SyncData)
        {
            CatalogueDefinition catalogueDefinition = Utils.ConvertXMLToCatalogueDefinition(catDefinition);
            CatalogueSyncData catalogueSyncData = Utils.ConvertXMLToCatalogueSyncData(SyncData);
            return null;
        }

        [HttpPost]
        public JsonResult CheckIfCatalogIsMappedWithFields(long CatalogID)
        {
            return Json(new SysTableCommonManager().CheckIfCatalogIsMappedWithFields(CatalogID));
        }
    }
}
