using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TopContractsEntities;
using TopContractsCommon10;
using System.Data.Entity.Validation;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Objects;
using TopContractsCommon10.Diagnostics;
using TopContractsCommon10.Configuration;
//using System.Data.objects;

namespace TopContractsDAL10
{
    /// <summary>
    /// A contract, with all of its entities
    /// </summary>
    public class Contract
    {
        private static List<FieldGroup> efFieldGroupsForContractInit = null;
        private static bool initializingCatalogRecords = false;

        /// <summary>
        /// Properties of the contract
        /// </summary>
        public ContractProperties Properties { get; set; }
        /// <summary>
        /// Contract ID (system ganarated)
        /// </summary>
        public long ID { get; set; }
        /// <summary>
        /// Set to true to delete a contract when save method is called.
        /// </summary>
        public bool Deleted { get; set; }
        /// <summary>
        /// Set to true to indicate to the save method that this contract is new
        /// </summary>
        public bool New { get; set; }

        #region Public lists

        /// <summary>
        /// Contract Activities (Events)
        /// </summary>
        public List<ContractActivity> ContractActivities { get; set; }

        /// <summary>
        /// Contract documents (attached files)
        /// </summary>
        public List<ContractDoc> ContractDocs { get; set; }

        /// <summary>
        /// Contract field groups (template), containing various fields and their values
        /// </summary>
        public List<ContractFieldGroup> ContractFieldGroups { get; set; }

        /// <summary>
        /// Contract Todos (Alerts)
        /// </summary>
        public List<ContractTodo> ContractTodos { get; set; }

        /// <summary>
        /// Contract users (authorized entities)
        /// </summary>
        public List<ContractUser> ContractUsers { get; set; }

        /// <summary>
        /// Contract applications (links to external systems)
        /// </summary>
        public List<ContractApplication> ContractApplications { get; set; }

        /// <summary>
        /// Contract galleries
        /// </summary>
        public List<ContractGallery> ContractGalleries { get; set; }

        /// <summary>
        /// Child Contracts
        /// </summary>
        public List<ChildContract> ChildContracts { get; set; }
        #endregion

        public Contract ParentContract { get; set; }
        //public ErrorDTO Error = null;

        public Contract()
        {
            //Error = null;
            Deleted = false;
            Properties = new ContractProperties();
            initLists();
        }

        public static TopContractsDAL10.ContractApplication GetApplications(long contractID, int ApplicationID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Contract efContract = context.Contracts.Where(u => u.ContractID == contractID).SingleOrDefault();
            if (efContract == null)
                throw new ExceptionDataContractReadNoSuchContract();

            TopContractsEntities.ContractApplication efConApp = new TopContractsEntities.ContractApplication();
            efConApp.ApplicationID = ApplicationID;
            efConApp.ContractID = contractID;
            efConApp.Application = context.Applications.SingleOrDefault(ca => ca.ApplicationID == ApplicationID);
            efConApp.Contract = context.Contracts.SingleOrDefault(ca => ca.ContractID == contractID);

            TopContractsDAL10.ContractApplication cApp = new ContractApplication(efConApp);

            return cApp;
        }

        /// <summary>
        /// This constructor is only used to fetch an existing contract, and not for creating a new one.
        /// </summary>
        /// <param action="ContractID">ID of contract to fetch</param>
        /// <param action="CultureIdentifier">Culture Identifier used for the selection of Fields and Field-Groups 
        /// names in the appropriate language.</param>
        /// <param name="paging">Object of ContractSectionPaging class to provide page sizes of various contract sections.</param>
        /// <param action="UserId">UserID may be passed to set the read-only value of RoleName of that user 
        /// in the selected contract</param>
        public Contract(long ContractID, string CultureIdentifier, ContractSectionPaging paging, long? UserId = null, ContractSections Content = ContractSections.All, List<long> GroupIDs = null)
        {
            Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Commencing CTOR for ContractID {0}, UserId {1}, Content {2}", ContractID, UserId, Content.ToString());
            //ErrorDTO Error = null; 
            //try
            //{
            Deleted = false;
            Properties = new ContractProperties();
            initLists();
            Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Lists initialized");

            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Contract efContract = context.Contracts.Where(u => u.ContractID == ContractID).SingleOrDefault();
            this.ID = efContract.ContractID;
            this.Properties.initDataFields(efContract);
            Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Data Fields initialized");
            this.Properties.initPrivateFields(efContract, CultureIdentifier, UserId);
            Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Private Fields initialized");

            if ((Content & ContractSections.Events) == ContractSections.Events)
            {
                this.ContractActivities.AddRange(efContract.ContractActivities.Select(ca => new ContractActivity(ca, CultureIdentifier)));
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Events added for ContractSections.Events");
            }
            if ((Content & ContractSections.Alerts) == ContractSections.Alerts)
            {
                this.ContractTodos.AddRange(efContract.ContractTodos.Select(ca => new ContractTodo(ca, CultureIdentifier)));
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Alerts added for ContractSections.Alerts");
            }
            if ((Content & ContractSections.AuthorizedEntities) == ContractSections.AuthorizedEntities)
            {
                bool showAllUser = false;
                long? MaxPageSizeUsers = null;

                if (paging.UsersPaging.PagingBehaviour == PagingParameter.DontPage)
                    showAllUser = true;
                else if (paging.UsersPaging.PagingBehaviour == PagingParameter.OverrideDatabaseValues)
                    MaxPageSizeUsers = paging.UsersPaging.PagingValue;
                else
                    MaxPageSizeUsers = GetPagingValueFromDB(efContract.OrganizationIdentifier, ContractSections.AuthorizedEntities);

                if (showAllUser == true || MaxPageSizeUsers == null)
                    this.ContractUsers.AddRange(efContract.ContractUsers.Select(ca => new ContractUser(ca, CultureIdentifier)));
                else
                    this.ContractUsers.AddRange(GetContractUsersByPaging(ContractID, CultureIdentifier, Convert.ToInt64(MaxPageSizeUsers)));

                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Users added for ContractSections.AuthorizedEntities");
            }
            if ((Content & ContractSections.Applications) == ContractSections.Applications)
            {
                this.ContractApplications.AddRange(efContract.ContractApplications.Select(ca => new ContractApplication(ca)));
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Applications added for ContractSections.Applications");
            }
            if ((Content & ContractSections.Fields) == ContractSections.Fields)
            {
                //Code Commented By Viplav for implement sorting related to (DisplayOrder / Alphabatically)

                //long groupID = 0;
                //foreach (TopContractsEntities.ContractField field in efContract.ContractFields.OrderBy(fl => fl.FieldGroupID))
                //{
                //    if (field.FieldGroupID != groupID)
                //    {
                //        groupID = field.FieldGroupID;
                //        this.ContractFieldGroups.Add(new ContractFieldGroup(field, CultureIdentifier));
                //    }
                //}

                //Viplav

                //------------Boaz 25-July-2013-------------
                //If this "contract" is a catalog record, and it is now fetched as part of a process of
                //fetching many such catalog records of the same type, then groupFields collection should
                //be initialized only once...
                List<FieldGroup> efFieldGroups = null;
                if (Contract.initializingCatalogRecords == false || Contract.efFieldGroupsForContractInit == null)
                {
                    efFieldGroups = new List<FieldGroup>();
                    //if (efContract.ContractFields.Any(fg => fg.FieldGroup.DisplayOrder == null))
                    //{
                    //    efFieldGroups = efContract.ContractFields.Select(fg => fg.FieldGroup).Distinct().OrderBy(fgl => fgl.FieldGroupsLNGs.FirstOrDefault(cul => cul.CultureId.Trim() == CultureIdentifier).DescShort).ToList();
                    //}
                    //else
                    //{
                    //    efFieldGroups = efContract.ContractFields.Select(fg => fg.FieldGroup).Distinct().OrderBy(fgd => fgd.DisplayOrder).ToList();
                    //}

                    //List<ContractTypeFieldGroupsMap> groupsMap = new List<ContractTypeFieldGroupsMap>();
                    //groupsMap = ApplicationCachedData.ContractTypeFieldGroupsMap;
                    if (efContract.ContractType.ParentContractTypeID == Utilities.contractTypeContractsID)
                    {
                        if (ApplicationCachedData.ContractTypeFieldGroupsMap.Any(ct => ct.ContractTypeID == efContract.ContractTypeID))
                        {
                            Dictionary<string, List<FieldGroup>> FieldGroupsByLang = ApplicationCachedData.ContractTypeFieldGroupsMap.Single(ct => ct.ContractTypeID == efContract.ContractTypeID).FieldGroupsByLang;
                            if (FieldGroupsByLang.Count() > 0)
                                if (FieldGroupsByLang.Any(lng => lng.Key == CultureIdentifier))
                                    efFieldGroups = FieldGroupsByLang.Single(lng => lng.Key == CultureIdentifier).Value;
                        }
                    }
                    else
                    {
                        if (ApplicationCachedData.CatalogFieldGroupsMap.Any(ct => ct.ContractTypeID == efContract.ContractTypeID))
                        {
                            Dictionary<string, List<FieldGroup>> FieldGroupsByLang = ApplicationCachedData.CatalogFieldGroupsMap.Single(ct => ct.ContractTypeID == efContract.ContractTypeID).FieldGroupsByLang;
                            if (FieldGroupsByLang.Count() > 0)
                                if (FieldGroupsByLang.Any(lng => lng.Key == CultureIdentifier))
                                    efFieldGroups = FieldGroupsByLang.Single(lng => lng.Key == CultureIdentifier).Value;
                        }
                    }

                    Contract.efFieldGroupsForContractInit = efFieldGroups;
                }
                else
                    efFieldGroups = Contract.efFieldGroupsForContractInit;

                // if list of GroupIDs is not null
                if (GroupIDs != null)
                {
                    if (GroupIDs.Count() > 0)
                    {
                        // retrieve only those fieldgroups which are requested.
                        efFieldGroups = efFieldGroups.Where(fg => GroupIDs.Contains(fg.FieldGroupID)).ToList();
                    }
                }

                foreach (FieldGroup fieldgroup in efFieldGroups)
                {
                    this.ContractFieldGroups.Add(new ContractFieldGroup(context, fieldgroup, CultureIdentifier, ContractID));
                }
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Fields added for ContractSections.Fields");
            }
            if ((Content & ContractSections.Documents) == ContractSections.Documents)
            {
                this.ContractDocs.AddRange(efContract.ContractDocs.Select(ca => new ContractDoc(ca)));
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Documents added for ContractSections.Documents");
            }
            if ((Content & ContractSections.Gallery) == ContractSections.Gallery)
            {
                this.ContractGalleries.AddRange(efContract.ContractGalleries.OrderByDescending(cg => cg.CreatedOn).Select(cg => new ContractGallery(cg)));
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Galleries added for ContractSections.Gallery");
            }

            if ((Content & ContractSections.ChildContract) == ContractSections.ChildContract)   // Condition Implemented for getting only neccessary Data by Viplav on 14 May 2013
            {
                this.ChildContracts = new ChildContract(ref context, efContract).ChildContracts;
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Child Contracts collection initialized");
            }

            if ((Content & ContractSections.ParantContract) == ContractSections.ParantContract) // Condition Implemented for getting only neccessary Data by Viplav on 14 May 2013
            {
                if (efContract.ParentContractID != null)
                {
                    //this.ParentContract = new Contract((long)efContract.ParentContractID, CultureIdentifier, UserId, Content);
                    this.ParentContract = new Contract((long)efContract.ParentContractID, CultureIdentifier, paging, UserId, Content); // Kai Cohen - Modified code to pass paging parameters.
                    Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Parent Contracts initialized");
                }
            }
        }


        /// <summary>
        /// This constructor is ONLY used for creating new contracts, not for getting information about existing contracts.
        /// </summary>
        /// <param action="ContractName">The action for the new contract being created</param>
        /// <param action="ContractTypeID">The type for the new contract being created</param>
        /// <param action="ContractStatusID">The status for the new contract being created</param>
        /// <param action="UserIdCreator">The ID of the user creating the contract</param>
        /// <param action="CultureIdentifier">Culture Identifier used for the selection of Fields and Field-Groups 
        /// names in the appropriate language, in the process of creating those for the contract. The language
        /// is not needed for the creation, so much as it is needed for the population of data in the newly created contract</param>
        public Contract(Guid OrganizationIdentifier, string ContractName, long ContractTypeID, long? ContractStatusID, long UserIdCreator, string CultureIdentifier, long RoleID = 0)
        {
            //int RoleIdCreator = (int)SpecialRoles.OwnerRoleID; //Always the "owner" is the one creating the contracts...
            long RoleIdCreator = RoleID; //RoleID is a default userid used for contractuser table
            try
            {
                Deleted = false;
                Properties = new ContractProperties();
                initLists();

                New = true;
                Properties.Name = ContractName;
                Properties.ContractTypeID = ContractTypeID;
                Properties.StatusID = (int?)ContractStatusID;
                Properties.OrganizationIdentifier = OrganizationIdentifier;

                ContractUsers.Add(new ContractUser() { New = true, EntryId = UserIdCreator, RoleID = RoleIdCreator });

                TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
                //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
                long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
                TopContractsDAL10.SystemTables.FieldGroups fieldGroups = new SystemTables.FieldGroups();
                if (context.ContractTypes.Any(ct => ct.ParentContractTypeID == ContractTypeContractsID && ct.ContractTypeID == ContractTypeID))
                    fieldGroups = SystemTables.FieldGroups.Get(false, false, true, CultureIdentifier);
                else
                    fieldGroups = SystemTables.FieldGroups.GetWithoutParentContractTypeID(false, false, true, CultureIdentifier);

                string logData1 = "FieldGroups created: " + Environment.NewLine;
                foreach (TopContractsDAL10.SystemTables.FieldGroup fGrp in fieldGroups.Entries)
                {
                    logData1 = logData1 + string.Format("FieldGroup info: groupID-{0}", fGrp.ID) + Environment.NewLine;
                }
                Logger.WriteGeneralVerbose("Contract class - CTOR", logData1);

                Logger.WriteGeneralVerbose("Contract class - CTOR", "Creating FieldGroups collection");
                foreach (TopContractsDAL10.SystemTables.FieldGroup fieldGroup in fieldGroups.Entries)
                {
                    //if (fieldGroup.ContractTypeIDsVisible.Any(ct => ct == ContractTypeID)) //Boaz - 7-Aug-2012
                    if (context.ContractTypes.Any(ct => ct.ParentContractTypeID == ContractTypeContractsID && ct.ContractTypeID == ContractTypeID))
                    {
                        if (fieldGroup.ContractTypeIDsVisible.Any(ct => ct == ContractTypeID) || fieldGroup.VisibleToAllContractTypes)
                            ContractFieldGroups.Add(new ContractFieldGroup(fieldGroup, CultureIdentifier));
                    }
                    else
                    {
                        if (fieldGroup.ContractTypeIDsVisible.Any(ct => ct == ContractTypeID))
                            ContractFieldGroups.Add(new ContractFieldGroup(fieldGroup, CultureIdentifier));
                    }
                }
                string logData2 = "ContractFieldGroups created: " + Environment.NewLine;
                foreach (ContractFieldGroup cFldGrp in ContractFieldGroups)
                {
                    logData2 = logData2 + string.Format("FieldGroup info: groupID-{0}", cFldGrp.EntryId) + Environment.NewLine;
                }
                Logger.WriteGeneralVerbose("Contract class - CTOR", logData2);
            }
            catch (Exception ex)
            {
                Logger.WriteExceptionError("Contract class - Contract", ex);
                ErrorDTO Error = new ErrorDTO(new ExceptionUnknownContractInit(ex));
            }
        }

        /// <summary>
        /// Get Role ID of user in contract (role of user in the authorized entities list)
        /// </summary>
        /// <param action="ContractID">Contract ID</param>
        /// <param action="UserID">User ID</param>
        /// <returns>Role ID</returns>
        public static long GetRoleIDInContract(long ContractID, long UserID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            try
            {
                long roleID =
                    context.Contracts.Where(c => c.ContractID == ContractID).SingleOrDefault().ContractUsers.Where(u => u.UserID == UserID).SingleOrDefault().Role.RoleID;

                return roleID;
            }
            catch (Exception ex)
            {
                return -1;
            }
        }


        /// <summary>
        /// Does contract exist with this ID?
        /// </summary>
        /// <param action="ContractID">Contract ID</param>
        /// <returns>True or false</returns>
        public static bool ContractExists(long ContractID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return (context.Contracts.Where(c => c.ContractID == ContractID).SingleOrDefault() != null);
        }

        /// <summary>
        /// Get a list of users linked to the contract (authorized entities)
        /// </summary>
        /// <param action="ContractID">Contract ID</param>
        /// <returns>List of TopContractsEntities.ContractUser objects</returns>
        public static List<TopContractsEntities.ContractUser> GetContractUsers(long ContractID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return (context.Contracts.Where(c => c.ContractID == ContractID).SingleOrDefault().ContractUsers.ToList());
        }

        /// <summary>
        /// get last value of ID field of contracts-table
        /// </summary>
        /// <returns></returns>
        public static long LastContractID()
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return context.Contracts.Max(c => c.ContractID);
        }

        public static void UpdateDocFileName(long docId, string FileName)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.ContractDoc efDoc = context.ContractDocs.SingleOrDefault(cd => cd.DocumentID == docId);
            if (efDoc != null)
                efDoc.FileName = FileName;
            context.SaveChanges();
        }

        public static void UpdateGalleryImageFilePath(long galleryId, string FilePath)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            foreach (TopContractsEntities.ContractGalleryImage efContractGalleryImage in context.ContractGalleryImages.Where(cd => cd.GalleryID == galleryId).ToList())
            {
                efContractGalleryImage.FileDirectory = FilePath;
            }
            context.SaveChanges();
        }

        internal Exception UpdateEfContract(ref TopContractsEntities.Contract efContract, int UpdatingUserID, DateTime UpdateDate)
        {
            try
            {
                efContract.ContractTypeID = Properties.ContractTypeID;
                efContract.DisplayCurrencyID = Properties.DisplayCurrencyID;
                efContract.Description = Properties.Description;
                efContract.ExternalID = Properties.ExternalID;
                efContract.Name = Properties.Name;
                efContract.ParentContractID = Properties.ParentContractID;
                efContract.StatusID = Properties.StatusID;
                if (efContract.ContractUpdateDetail == null) //This is a new entry
                    efContract.ContractUpdateDetail = new ContractUpdateDetail() { ContractID = efContract.ContractID };
                efContract.ContractUpdateDetail.UpdateDate = UpdateDate;
                efContract.ContractUpdateDetail.UpdateUserID = UpdatingUserID;
            }
            catch (Exception ex)
            {
                return ex;
            }
            return null;
        }

        private void initLists()
        {
            ContractActivities = new List<ContractActivity>();
            ContractDocs = new List<ContractDoc>();
            ContractFieldGroups = new List<ContractFieldGroup>();
            ContractTodos = new List<ContractTodo>();
            ContractUsers = new List<ContractUser>();
            ContractApplications = new List<ContractApplication>();
            ContractGalleries = new List<ContractGallery>();
            ChildContracts = new List<ChildContract>();
        }

        /// <summary>
        /// Save contract (delete or add according to Deleted and New properties)
        /// </summary>
        /// <param action="UpdatingUserID">Id of user performing the update</param>
        /// <param action="AuditChanges">Audit changes of update</param>
        /// <returns>The ID of the contract saved, or 0 if contract was deleted, or -1 to indicate a failure to save contract</returns>
        public long Save(int UpdatingUserID, bool AuditChanges)
        {
            Logger.WriteGeneralVerbose("Contract class - save", "updating ContractActivity of {0}", this.ID);
            //Logger.Write(LogCategory.General, (this.New ? "Creating new " : (this.Deleted ? "Deleting " : "Updating ")) + "contract", "contract ID " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            DateTime updateDate = DateTime.Now;
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Contract efContract = null;
            if (this.New)
            {
                efContract = new TopContractsEntities.Contract();
                efContract.ContractUpdateDetail = new ContractUpdateDetail();
                //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
                long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
                if (context.FieldGroups.Count(grp => grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll) > 0)
                    //foreach (FieldGroup grp in context.FieldGroups.Where(
                    //          grp => (grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll || grp.FieldGroupsContractTypesMAPs.Any(cTypeMap => cTypeMap.ContractType.ParentContractTypeID == ContractTypeContractsID) == true) && grp.Inactive == false)) //Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fieldsgroup
                    foreach (FieldGroup grp in context.FieldGroups.Where(
                              grp => (grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll && grp.Inactive == false)).ToList()) // Jan 31, 2013 - Need to be tested properly as now loop is running for VisibleToAll efFieldGroupsForContractInit
                    {
                        foreach (Field fld in grp.Fields.Where(grpf => grpf.Inactive == false)) //Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fields
                        {
                            if (fld.FieldType == (int)FieldTypes.EntityLink)
                            {
                                foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault contDef in context.ContractTypesFieldsToCreateDefaults.Where(c => c.ContractTypeID == fld.LinkedEntityID))
                                {
                                    //efContract.ContractFields.Add(new TopContractsEntities.ContractField() { FieldGroupID = grp.EntryIdentifier, FieldID = contDef.FieldID, FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                                    efContract.ContractFields.Add(new TopContractsEntities.ContractField() { OrganizationIdentifier = this.Properties.OrganizationIdentifier, FieldGroupID = grp.EntryIdentifier, FieldID = fld.FieldID, CatalogFieldID = contDef.FieldID, FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                                }
                            }
                            else
                                efContract.ContractFields.Add(new TopContractsEntities.ContractField() { OrganizationIdentifier = this.Properties.OrganizationIdentifier, FieldGroupID = grp.EntryIdentifier, FieldID = fld.EntryIdentifier, FieldValue = (fld.FieldType == (int)FieldTypes.ListSingle && fld.UseFirstAsDefault == true ? fld.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                        }
                    }
                if (context.FieldGroups.Count(grp => grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && grp.FieldGroupsContractTypesMAPs.Any(mp => mp.ContractTypeID == this.Properties.ContractTypeID)) > 0)
                    foreach (FieldGroup grp in context.FieldGroups.Where(grp => grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && grp.Inactive == false && grp.FieldGroupsContractTypesMAPs.Any(mp => mp.ContractTypeID == this.Properties.ContractTypeID)))//Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fieldsgroup
                        foreach (Field fld in grp.Fields.Where(grpf => grpf.Inactive == false)) //Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fields
                        {
                            if (fld.FieldType == (int)FieldTypes.EntityLink)
                            {
                                foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault contDef in context.ContractTypesFieldsToCreateDefaults.Where(c => c.ContractTypeID == fld.LinkedEntityID))
                                {
                                    //efContract.ContractFields.Add(new TopContractsEntities.ContractField() { FieldGroupID = grp.EntryIdentifier, FieldID = contDef.FieldID, FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                                    efContract.ContractFields.Add(new TopContractsEntities.ContractField() { OrganizationIdentifier = this.Properties.OrganizationIdentifier, FieldGroupID = grp.EntryIdentifier, FieldID = fld.FieldID, CatalogFieldID = contDef.FieldID, FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                                }
                            }
                            else
                                efContract.ContractFields.Add(new TopContractsEntities.ContractField() { OrganizationIdentifier = this.Properties.OrganizationIdentifier, FieldGroupID = grp.EntryIdentifier, FieldID = fld.EntryIdentifier, FieldValue = (fld.FieldType == (int)FieldTypes.ListSingle && fld.UseFirstAsDefault == true ? fld.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                        }
            }
            else
            {
                efContract = context.Contracts.Where(u => u.ContractID == this.ID).SingleOrDefault();
            }

            if (this.Deleted)
            {
                #region DELETING RELATED ENTITIES -----------------------------------------------------------------------------

                //For some unknown reason, eliminating the if-count>0 from before each of the foreach(s), throws an "object not set" exception even though alerts exist!
                context.ContractUpdateDetails.Remove(context.ContractUpdateDetails.Single(entry => entry.ContractID == this.ID));
                if (context.ContractApplications.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractApplication efContractApplication in context.ContractApplications.Where(entry => entry.ContractID == this.ID))
                        context.ContractApplications.Remove(efContractApplication);
                if (context.ContractActivities.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractActivity efContractActivity in context.ContractActivities.Where(entry => entry.ContractID == this.ID))
                    {
                        context.ContractActivities.Remove(efContractActivity);
                    }
                if (context.ContractDocs.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractDoc efContractDoc in context.ContractDocs.Where(entry => entry.ContractID == this.ID))
                        context.ContractDocs.Remove(efContractDoc);
                if (context.ContractGalleries.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractGallery efContractGallery in context.ContractGalleries.Where(entry => entry.ContractID == this.ID))
                    {
                        if (efContractGallery.ContractGalleryImages != null && efContractGallery.ContractGalleryImages.Count() > 0)
                        {
                            foreach (TopContractsEntities.ContractGalleryImage image in efContractGallery.ContractGalleryImages.ToList())
                            {
                                context.ContractGalleryImages.Remove(image);
                            }
                        }
                        context.ContractGalleries.Remove(efContractGallery);
                    }
                if (context.ContractFields.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractField efContractField in context.ContractFields.Where(entry => entry.ContractID == this.ID))
                        context.ContractFields.Remove(efContractField);
                if (context.ContractTodos.Count(entry => entry.ContractID == this.ID) > 0)
                {
                    foreach (TopContractsEntities.ContractTodo efContractTodo in context.ContractTodos.Where(entry => entry.ContractID == this.ID))
                    {
                        if (efContractTodo.ContractTodoRecipients != null)
                            for (int indx = efContractTodo.ContractTodoRecipients.Count - 1; indx >= 0; indx--)
                                context.ContractTodoRecipients.Remove(efContractTodo.ContractTodoRecipients.ElementAt(indx));
                        if (efContractTodo.ContractTodoUnits != null)
                            for (int indx = efContractTodo.ContractTodoUnits.Count - 1; indx >= 0; indx--)
                                context.ContractTodoUnits.Remove(efContractTodo.ContractTodoUnits.ElementAt(indx));
                        if (efContractTodo.DoneTodos != null)
                            for (int indx = efContractTodo.DoneTodos.Count - 1; indx >= 0; indx--)
                                context.DoneTodos.Remove(efContractTodo.DoneTodos.ElementAt(indx));
                        context.ContractTodos.Remove(efContractTodo);
                    }
                }
                foreach (TopContractsEntities.ContractUser efContractUser in context.ContractUsers.Where(entry => entry.ContractID == this.ID))
                    context.ContractUsers.Remove(efContractUser);

                #endregion
                context.Contracts.Remove(efContract);

            }
            if (this.New)
            {
                updateEfContract(ref efContract, ref context);
                context.Contracts.Add(efContract);
            }
            if (this.New == false & this.Deleted == false)
            {
                updateEfContract(ref efContract, ref context);
            }

            //Boaz-1 (8-Aug-2012) ------------------------------------------------------
            //All Todos which are linked to new events, should be made their "children" in the EF so that the foreign
            //key values will be  automatically generated when saving to the DB
            foreach (TopContractsEntities.ContractTodo todo in efContract.ContractTodos.Where(td => td.ActivityID < 0))
            {
                efContract.ContractActivities.SingleOrDefault(ca => ca.ActivityID == todo.ActivityID).ContractTodos.Add(todo);
            }

            // code to remove images from context for a deleted gallery
            foreach (ContractGallery gallery in this.ContractGalleries)
            {
                if (gallery.Deleted)
                {
                    foreach (TopContractsEntities.ContractGalleryImage galleryImage in context.ContractGalleryImages.Where(g => g.GalleryID == gallery.EntryId))
                        context.ContractGalleryImages.Remove(galleryImage);
                }

                // code to remove a deleted gallery image
                if (!gallery.New)
                {
                    foreach (ContractGalleryImage image in gallery.Images)
                    {
                        if (image.Deleted)
                        {
                            if (context.ContractGalleryImages.Any(g => g.GalleryImageID == image.EntryId))
                            {
                                TopContractsEntities.ContractGalleryImage galleryImage = context.ContractGalleryImages.SingleOrDefault(g => g.GalleryImageID == image.EntryId);
                                context.ContractGalleryImages.Remove(galleryImage);
                            }
                        }
                    }
                }
            }

            bool updateContractUpdateDetails = false;
            if (this.Deleted == false)
            {
                //If any of the entities related to the contract has changed, the Update-Date of the contract record itself should be updated...
                foreach (var entry in context.ChangeTracker.Entries())
                {
                    //Boaz 7-Aug-2012
                    //if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified && !(entry.Entity is EFContractRelatedEntryWithUpdate))
                    if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified || entry.State == System.Data.EntityState.Deleted)
                    {
                        updateContractUpdateDetails = true;
                    }
                }

                if (updateContractUpdateDetails)
                    foreach (var entry in context.ChangeTracker.Entries())
                    {
                        //Boaz 7-Aug-2012
                        //If any changed was made to a record in any table (entities related to the contract) which has 
                        //UpdateDate and UpdateUserID fields, these fields are updated to reflect the change. 
                        //These fields are NOT handled by the individual classes committing the changes to the 
                        //database - they are handled centrally here to cut-down on the code
                        if (entry.Entity is EFContractRelatedEntryWithUpdate && entry.State != EntityState.Unchanged)
                        //if (entry.Entity is EFContractRelatedEntryWithUpdate)
                        {
                            ((EFContractRelatedEntryWithUpdate)entry.Entity).UpdatingDate = updateDate;
                            ((EFContractRelatedEntryWithUpdate)entry.Entity).UpdatingUserID = UpdatingUserID;
                        }
                        if (entry.Entity is TopContractsEntities.ContractDoc && entry.State == EntityState.Deleted)
                        {
                            TopContractsEntities.User Userdetail = context.Users.Where(usr => usr.UserID == UpdatingUserID).SingleOrDefault();
                            if (Userdetail != null)
                            {
                                if (context.Roles.Where(rol => rol.RoleID == Userdetail.DefaultRoleID).SingleOrDefault().DeleteDocs == false)
                                    entry.State = EntityState.Unchanged;
                            }
                        }
                        if (entry.Entity is TopContractsEntities.ContractActivity && entry.State == EntityState.Deleted)
                        {
                            TopContractsEntities.User Userdetail = context.Users.Where(usr => usr.UserID == UpdatingUserID).SingleOrDefault();
                            if (Userdetail != null)
                            {
                                if (context.Roles.Where(rol => rol.RoleID == Userdetail.DefaultRoleID).SingleOrDefault().DeleteActivities == false)
                                    entry.State = EntityState.Unchanged;
                                else  //********** Code Implemented for remove contract event with all associated Alerts,AlertsRecipiets & AlertsDone by Viplav on 20-Nov-2013**********************************
                                {
                                    List<TopContractsEntities.ContractTodo> contToDos = context.ContractTodos.Where(tod => tod.ActivityID == ((TopContractsEntities.ContractActivity)entry.Entity).ActivityID).ToList();
                                    foreach (TopContractsEntities.ContractTodo cntToDos in contToDos)
                                    {
                                        foreach (TopContractsEntities.ContractTodoRecipient cntToDosRec in context.ContractTodoRecipients.Where(tod => tod.TodoID == cntToDos.TodoID))
                                            context.ContractTodoRecipients.Remove(cntToDosRec);
                                        foreach (TopContractsEntities.DoneTodo doneToDos in context.DoneTodos.Where(todo => todo.OriginalTodoID == cntToDos.TodoID))
                                            context.DoneTodos.Remove(doneToDos);

                                        context.ContractTodos.Remove(cntToDos);
                                    }
                                }//*****************************************************************************************************************************************************************************
                            }
                        }
                    }
            }
            if (updateContractUpdateDetails)
            {
                efContract.ContractUpdateDetail.UpdateDate = updateDate;
                efContract.ContractUpdateDetail.UpdateUserID = UpdatingUserID;
            }
            //We want to keep tracking the changes after calling SaveChanges, for the purpose of auditing
            ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
            objectContext.DetectChanges();
            try
            {
                //Using SaveOptions.None to keep change-tracking... Requires objectContext.DetectChanges() before and objectContext.AcceptAllChanges() after...
                int rowsAffected = objectContext.SaveChanges(SaveOptions.None);
            }
            catch (System.Data.UpdateException updEx)
            {
                if (updEx.InnerException != null)
                    if (updEx.InnerException.Message.Contains("DELETE statement conflicted with the REFERENCE constraint") &&
                        updEx.InnerException.Message.Contains("FK_ContractTodos_ContractActivities"))
                    {
                        //    Logger.Write(updEx, System.Diagnostics.TraceEventType.Warning);
                        Logger.WriteGeneralWarning("Contract - Save()", "An attempt has been made to delete an Event With an Alert, in contract #{0}, by user #{1}", this.ID, UpdatingUserID);
                        throw new ExceptionDataContractSaveDeleteEventWithAlert();
                    }
                    else if (updEx.InnerException.Message.Contains("DELETE statement conflicted with the REFERENCE constraint") &&
                        updEx.InnerException.Message.Contains("FK_ContractFields_ContractActivities"))
                    {
                        Logger.WriteGeneralWarning("Contract - Save()", "An attempt has been made to delete an Event linked to an event type field, in contract #{0}, by user #{1}", this.ID, UpdatingUserID);
                        throw new ExceptionDataContractSaveDeleteEventWithEventTypeFields();
                    }
                    else if (updEx.InnerException.Message.Contains("FK_Contracts_Contracts") &&
                       updEx.InnerException.Message.Contains("ParentContractID"))
                    {
                        Logger.WriteGeneralWarning("Contract - Save()", "An attempt has been made to delete contract #{0}, by user #{1}, when this contract is a parenty of another contract", this.ID, UpdatingUserID);
                        throw new ExceptionDataContractDeleteDeleteContractWithChild();
                    }
                    else if (updEx.InnerException.Message.Contains("DELETE statement conflicted with the REFERENCE constraint") &&
                        updEx.InnerException.Message.Contains("FK_ContractFields_ContractDocs"))
                    {
                        Logger.WriteGeneralWarning("Contract - Save()", "Contract - Save()", "An attempt has been made to delete a document linked to a document-type field, in contract #{0}, by user #{1}", this.ID, UpdatingUserID);
                        throw new ExceptionDataContractSaveDeleteDocsWithDocumentTypeFields();
                    }
                    else
                    {
                        //  Logger.Write(updEx, System.Diagnostics.TraceEventType.Error);
                        Logger.WriteExceptionError("Contract - Save()", updEx, "The attempt to save contract #{0}, by user #{1}, has failed", this.ID, UpdatingUserID);
                        throw updEx;
                    }
            }

            //Boaz-1 (8-Aug-2012) -------------------------------------------------------
            //#region Setting the connection between new activities and their related new todos
            //if (this.Deleted == false)
            //{
            //    foreach (var newActivity in context.ChangeTracker.Entries())
            //    {
            //        if (newActivity.State == System.Data.EntityState.Added && newActivity.Entity is TopContractsEntities.ContractActivity)
            //        {
            //            foreach (var newTodo in context.ChangeTracker.Entries())
            //            {
            //                if (newTodo.State == System.Data.EntityState.Added && newTodo.Entity is TopContractsEntities.ContractTodo)
            //                {
            //                    if ((newTodo.Entity as TopContractsEntities.ContractTodo).ActivityID == (newActivity.Entity as TopContractsEntities.ContractActivity).ActivityID)
            //                    {
            //                        (newActivity.Entity as TopContractsEntities.ContractActivity).ContractTodos.Add((newTodo.Entity as TopContractsEntities.ContractTodo));
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}
            //#endregion

            //TopContractsEntities.ContractTodo todoToChange = null;


            if (AuditChanges)
            {
                HistManager histManager = new HistManager();
                int recordsWrittenToHistory = histManager.AuditChanges(updateDate, UpdatingUserID, this.New, this.Deleted, context.ChangeTracker.Entries().Where(e => e.State != System.Data.EntityState.Unchanged || e.Entity is TopContractsEntities.Contract));
            }

            objectContext.AcceptAllChanges();

            long contractIdSaved = -1; //will indicate failure, if no number is set
            foreach (var entry in context.ChangeTracker.Entries())
            {
                Logger.Write("entering the loop - for context.ChangeTracker.Entries()", System.Diagnostics.TraceEventType.Verbose);
                if (entry.Entity is TopContractsEntities.Contract)
                {
                    contractIdSaved = ((TopContractsEntities.Contract)entry.Entity).ContractID;
                }
                if (entry.Entity is TopContractsEntities.ContractDoc)
                {
                    TopContractsEntities.ContractDoc efDoc = entry.Entity as TopContractsEntities.ContractDoc;
                    TopContractsDAL10.ContractDoc doc = this.ContractDocs.SingleOrDefault(d => d.FileName == efDoc.FileName);
                    if (doc != null)
                    {
                        if (doc.New)
                        {
                            doc.EntryId = efDoc.DocumentID; //This is done especially for the process of file copying...
                        }
                    }
                }
                if (entry.Entity is TopContractsEntities.ContractGallery)
                {
                    TopContractsEntities.ContractGallery efGallery = entry.Entity as TopContractsEntities.ContractGallery;
                    foreach (TopContractsDAL10.ContractGallery gallery in this.ContractGalleries.Where(g => g.GalleryName == efGallery.GalleryName).ToList())
                    {
                        if (gallery.New)
                        {
                            gallery.EntryId = efGallery.GalleryID; //This is done especially for the process of file copying...
                        }
                    }
                }
            }

            if (this.Deleted)
                return 0;
            return contractIdSaved;
        }

        public long SaveEntityRecord(int UpdatingUserID, bool AuditChanges)
        {
            Logger.Write(LogCategory.General, (this.New ? "Creating new " : (this.Deleted ? "Deleting " : "Updating ")) + "contract", "contract ID " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            DateTime updateDate = DateTime.Now;
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Contract efContract = null;
            if (this.New)
            {
                efContract = new TopContractsEntities.Contract();
                efContract.ContractUpdateDetail = new ContractUpdateDetail();

                if (context.FieldGroups.Count(grp => grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && grp.FieldGroupsContractTypesMAPs.Any(mp => mp.ContractTypeID == this.Properties.ContractTypeID)) > 0)
                    foreach (FieldGroup grp in context.FieldGroups.Where(grp => grp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && grp.Inactive == false && grp.FieldGroupsContractTypesMAPs.Any(mp => mp.ContractTypeID == this.Properties.ContractTypeID)))//Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fieldsgroup
                        foreach (Field fld in grp.Fields.Where(grpf => grpf.Inactive == false)) //Viplav - 16-Oct-2012 // Implemented inactive condition for getting only active fields
                        {
                            efContract.ContractFields.Add(new TopContractsEntities.ContractField() { OrganizationIdentifier = this.Properties.OrganizationIdentifier, FieldGroupID = grp.EntryIdentifier, FieldID = fld.EntryIdentifier, FieldValue = (fld.FieldType == (int)FieldTypes.ListSingle && fld.UseFirstAsDefault == true ? fld.FieldListItems.ElementAt(0).FieldListItemID.ToString() : ""), RecordCounter = Convert.ToInt64(RecordCounter.Default) });
                        }
            }
            else
            {
                efContract = context.Contracts.Where(u => u.ContractID == this.ID).SingleOrDefault();
            }

            if (this.Deleted)
            {
                #region DELETING RELATED ENTITIES -----------------------------------------------------------------------------

                //For some unknown reason, eliminating the if-count>0 from before each of the foreach(s), throws an "object not set" exception even though alerts exist!
                context.ContractUpdateDetails.Remove(context.ContractUpdateDetails.Single(entry => entry.ContractID == this.ID));

                if (context.ContractFields.Count(entry => entry.ContractID == this.ID) > 0)
                    foreach (TopContractsEntities.ContractField efContractField in context.ContractFields.Where(entry => entry.ContractID == this.ID))
                        context.ContractFields.Remove(efContractField);

                foreach (TopContractsEntities.ContractUser efContractUser in context.ContractUsers.Where(entry => entry.ContractID == this.ID))
                    context.ContractUsers.Remove(efContractUser);

                #endregion
                context.Contracts.Remove(efContract);

            }
            if (this.New)
            {
                updateEfContract(ref efContract, ref context);
                context.Contracts.Add(efContract);
            }
            if (this.New == false & this.Deleted == false)
            {
                updateEfContract(ref efContract, ref context);
            }

            //Boaz-1 (8-Aug-2012) ------------------------------------------------------
            //All Todos which are linked to new events, should be made their "children" in the EF so that the foreign
            //key values will be  automatically generated when saving to the DB
            foreach (TopContractsEntities.ContractTodo todo in efContract.ContractTodos.Where(td => td.ActivityID < 0))
            {
                efContract.ContractActivities.SingleOrDefault(ca => ca.ActivityID == todo.ActivityID).ContractTodos.Add(todo);
            }

            bool updateContractUpdateDetails = false;
            if (this.Deleted == false)
            {
                //If any of the entities related to the contract has changed, the Update-Date of the contract record itself should be updated...
                foreach (var entry in context.ChangeTracker.Entries())
                {
                    //Boaz 7-Aug-2012
                    //if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified && !(entry.Entity is EFContractRelatedEntryWithUpdate))
                    if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified || entry.State == System.Data.EntityState.Deleted)
                    {
                        updateContractUpdateDetails = true;
                    }
                }

                if (updateContractUpdateDetails)
                    foreach (var entry in context.ChangeTracker.Entries())
                    {
                        //Boaz 7-Aug-2012
                        //If any changed was made to a record in any table (entities related to the contract) which has 
                        //UpdateDate and UpdateUserID fields, these fields are updated to reflect the change. 
                        //These fields are NOT handled by the individual classes committing the changes to the 
                        //database - they are handled centrally here to cut-down on the code
                        if (entry.Entity is EFContractRelatedEntryWithUpdate && entry.State != EntityState.Unchanged)
                        //if (entry.Entity is EFContractRelatedEntryWithUpdate)
                        {
                            ((EFContractRelatedEntryWithUpdate)entry.Entity).UpdatingDate = updateDate;
                            ((EFContractRelatedEntryWithUpdate)entry.Entity).UpdatingUserID = UpdatingUserID;
                        }
                    }
            }
            if (updateContractUpdateDetails)
            {
                efContract.ContractUpdateDetail.UpdateDate = updateDate;
                efContract.ContractUpdateDetail.UpdateUserID = UpdatingUserID;
            }
            //We want to keep tracking the changes after calling SaveChanges, for the purpose of auditing
            ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
            objectContext.DetectChanges();
            try
            {
                //Using SaveOptions.None to keep change-tracking... Requires objectContext.DetectChanges() before and objectContext.AcceptAllChanges() after...
                int rowsAffected = objectContext.SaveChanges(SaveOptions.None);
            }
            catch (System.Data.UpdateException updEx)
            {
                if (updEx.InnerException != null)
                    if (updEx.InnerException.Message.Contains("DELETE statement conflicted with the REFERENCE constraint") &&
                        updEx.InnerException.Message.Contains("FK_ContractTodos_ContractActivities"))
                        //{
                        //    Logger.Write(updEx, System.Diagnostics.TraceEventType.Warning);
                        throw new ExceptionDataContractSaveDeleteEventWithAlert();
                    //}
                    else if (updEx.InnerException.Message.Contains("FK_Contracts_Contracts") &&
                        updEx.InnerException.Message.Contains("ParentContractID"))
                        throw new ExceptionDataContractDeleteDeleteContractWithChild();
                    else
                        //{
                        //  Logger.Write(updEx, System.Diagnostics.TraceEventType.Error);
                        throw updEx;
                //}
            }

            if (AuditChanges)
            {
                HistManager histManager = new HistManager();
                int recordsWrittenToHistory = histManager.AuditChanges(updateDate, UpdatingUserID, this.New, this.Deleted, context.ChangeTracker.Entries().Where(e => e.State != System.Data.EntityState.Unchanged || e.Entity is TopContractsEntities.Contract));
            }

            objectContext.AcceptAllChanges();

            long contractIdSaved = -1; //will indicate failure, if no number is set
            foreach (var entry in context.ChangeTracker.Entries())
            {
                Logger.Write("entering the loop - for context.ChangeTracker.Entries()", System.Diagnostics.TraceEventType.Verbose);
                if (entry.Entity is TopContractsEntities.Contract)
                {
                    contractIdSaved = ((TopContractsEntities.Contract)entry.Entity).ContractID;
                }
                if (entry.Entity is TopContractsEntities.ContractDoc)
                {
                    TopContractsEntities.ContractDoc efDoc = entry.Entity as TopContractsEntities.ContractDoc;
                    TopContractsDAL10.ContractDoc doc = this.ContractDocs.SingleOrDefault(d => d.FileName == efDoc.FileName);
                    if (doc != null)
                    {
                        if (doc.New)
                        {
                            doc.EntryId = efDoc.DocumentID; //This is done especially for the process of file copying...
                        }
                    }
                }
            }

            if (this.Deleted)
                return 0;
            return contractIdSaved;
        }

        private void updateEfContract(ref TopContractsEntities.Contract efContract, ref TopContractsV01Entities context)
        {
            if (this.Properties != null)
                this.Properties.updateEfFields(ref efContract);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractActivity of {0}", this.ID);
            //Logger.Write("updating ContractActivity of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractActivities != null)
                foreach (ContractActivity activity in this.ContractActivities.Where(ent => (ent.Deleted && ent.New) != true))
                    activity.UpdateEntity(ref context, efContract.ContractActivities, context.ContractActivities, this.ID, this.Properties.OrganizationIdentifier);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractApplications of {0}", this.ID);
            //Logger.Write("updating ContractApplications of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractApplications != null)
                foreach (ContractApplication application in this.ContractApplications.Where(ent => (ent.Deleted && ent.New) != true))
                    application.UpdateEntity(ref context, efContract.ContractApplications, context.ContractApplications, this.ID, this.Properties.OrganizationIdentifier);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractDocs of {0}", this.ID);
            //Logger.Write("updating ContractDocs of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractDocs != null)
                foreach (ContractDoc doc in this.ContractDocs.Where(ent => (ent.Deleted && ent.New) != true))
                    doc.UpdateEntity(ref context, efContract.ContractDocs, context.ContractDocs, this.ID, this.Properties.OrganizationIdentifier);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractGalleries of {0}", this.ID);
            if (this.ContractGalleries != null)
                foreach (ContractGallery gallery in this.ContractGalleries.Where(ent => (ent.Deleted && ent.New) != true))
                    gallery.UpdateEntity(ref context, efContract.ContractGalleries, context.ContractGalleries, this.ID, this.Properties.OrganizationIdentifier);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractFieldGroups of {0}", this.ID);
            //Logger.Write("updating ContractFieldGroups of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractFieldGroups != null)
                foreach (ContractFieldGroup FieldGroup in this.ContractFieldGroups.Where(ent => (ent.Deleted && ent.New) != true))
                    FieldGroup.UpdateEntity(ref context, efContract.ContractFields, null, ID, this.Properties.OrganizationIdentifier);
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractTodos of {0}", this.ID);
            //Logger.Write("updating ContractTodos of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractTodos != null)
                foreach (ContractTodo Todo in this.ContractTodos.Where(ent => (ent.Deleted && ent.New) != true))
                    //Todo.UpdateEntity(ref context, efContract.ContractTodos, efContract.ContractActivities.First().ContractTodos, this.ID);
                    Todo.UpdateEntity(ref context, efContract.ContractTodos, context.ContractTodos, this.ID, this.Properties.OrganizationIdentifier);
            //var xxxx = efContract.ContractActivities.FirstOrDefault().ContractTodos;
            //var yyyy = context.ContractTodos;
            Logger.WriteGeneralVerbose("Contract class - updateEfContract", "updating ContractUsers of {0}", this.ID);
            //Logger.Write("updating ContractUsers of " + this.ID.ToString(), System.Diagnostics.TraceEventType.Information);
            if (this.ContractUsers != null)
                foreach (ContractUser User in this.ContractUsers.Where(ent => (ent.Deleted && ent.New) != true))
                    User.UpdateEntity(ref context, efContract.ContractUsers, context.ContractUsers, this.ID, this.Properties.OrganizationIdentifier);
        }

        /// <summary>
        /// Copy Contract Field (Copy Contracts Fields according to Contract Type)
        /// </summary>
        /// <param action="parentContractID">Id of parentContractID</param>
        /// <param action="childContractID">Id of childContractID</param>
        /// <param action="parentContractTypeID">Id of parentContractTypeID</param>
        /// <param action="childContractTypeID">Id of childContractTypeID</param>
        /// <param action="CultureIdentifier">CultureIdentifier</param>        
        /// <returns></returns>
        public static void CopyContractField(long parentContractID, long childContractID, int parentContractTypeID, int childContractTypeID, string CultureIdentifier)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            if (parentContractTypeID == childContractTypeID)
            {
                foreach (var childContractField in context.ContractFields.Where(cFld => cFld.ContractID == childContractID).ToList())
                {
                    context.ContractFields.Remove(childContractField);
                }

                foreach (var parentContractField in context.ContractFields.Where(cFld => cFld.ContractID == parentContractID).ToList())
                {
                    TopContractsEntities.ContractField contractField = new TopContractsEntities.ContractField();
                    contractField = parentContractField;
                    contractField.ContractID = childContractID;

                    if (parentContractField.LinkedDocumentID != null && parentContractField.LinkedDocumentID > 0)
                    {
                        string docIdToSearch = (Constants.entityFieldsDivider + parentContractField.LinkedDocumentID + Constants.entityFieldsDivider);
                        if (context.ContractDocs.Any(cd => cd.ExternalID.Contains(docIdToSearch)) && context.ContractDocs.Count(cd => cd.ExternalID.Contains(docIdToSearch)) == 1)
                        {
                            long ContractDocID = context.ContractDocs.Single(cDoc => cDoc.ExternalID.Contains(docIdToSearch)).DocumentID;
                            contractField.LinkedDocumentID = ContractDocID;
                        }
                    }

                    context.ContractFields.Add(contractField);
                }
            }
            else
            {
                List<int> commonFieldGroupIDs = getCommonContractFieldGroup(parentContractTypeID, childContractTypeID, CultureIdentifier);
                foreach (int cfg in commonFieldGroupIDs)
                {
                    foreach (var childContractField in context.ContractFields.Where(cFld => cFld.ContractID == childContractID && cFld.FieldGroupID == cfg).ToList())
                    {
                        context.ContractFields.Remove(childContractField);
                    }

                    foreach (var parentContractField in context.ContractFields.Where(cFld => cFld.ContractID == parentContractID && cFld.FieldGroupID == cfg).ToList())
                    {
                        TopContractsEntities.ContractField contractField = new TopContractsEntities.ContractField();
                        contractField = parentContractField;
                        contractField.ContractID = childContractID;

                        if (parentContractField.LinkedDocumentID != null && parentContractField.LinkedDocumentID > 0)
                        {
                            string docIdToSearch = (Constants.entityFieldsDivider + parentContractField.LinkedDocumentID + Constants.entityFieldsDivider);
                            if (context.ContractDocs.Any(cd => cd.ExternalID.Contains(docIdToSearch)) && context.ContractDocs.Count(cd => cd.ExternalID.Contains(docIdToSearch)) == 1)
                            {
                                long ContractDocID = context.ContractDocs.Single(cDoc => cDoc.ExternalID.Contains(docIdToSearch)).DocumentID;
                                contractField.LinkedDocumentID = ContractDocID;
                            }
                        }

                        context.ContractFields.Add(contractField);
                    }
                }
            }

            context.SaveChanges();
        }

        /// <summary>
        /// UpdateCopyContractDocDirectory (Update the directory action according to new contract)
        /// </summary>
        /// <param action="NewContractID">Id of NewContractID performing the update</param>
        /// <returns></returns>
        public static void UpdateCopyContractDocDirectory(long NewContractID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            foreach (var Contractdoc in context.ContractDocs.Where(cdoc => cdoc.ContractID == NewContractID).ToList())
            {
                Contractdoc.FileDirectory = Storage.DocsPath(NewContractID);
            }
            context.SaveChanges();
        }


        /// <summary>
        /// getEntityContracts Method used to get all contracts according to contracttypeID for entities records
        /// </summary>
        /// <param action="contractTypeID">contractTypeID is used to retreive contracts from DB</param>
        /// <param action="CultureIdentifier">CultureIdentifier is used to get data according to current culture</param>
        /// <returns>List of contracts</returns>
        public static List<TopContractsDAL10.Contract> getEntityContracts(long contractTypeID, string CultureIdentifier, Guid OrganizationIdentifier, int UserID)
        {
            List<Contract> contracts = new List<Contract>();
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            List<long> contractIDs = context.Contracts.Where(cnts => cnts.ContractTypeID == contractTypeID).Select(cnt => cnt.ContractID).ToList();
            if (contractIDs.Count > 0)
            {
                //This flag is used to inform the contract initialization process that many "contracts" (catalog records)
                //of the same type are now being created, so it needs to avoid re-creating structures which are common
                //to all these "contracts"...
                initializingCatalogRecords = true;
                TopContractsDAL10.Contract.efFieldGroupsForContractInit = null;
                foreach (long contractID in contractIDs)
                {
                    //TopContractsDAL10.Contract conts = new Contract(contractID, CultureIdentifier, null, ContractSections.Fields);
                    ContractSectionPaging dontPage = new ContractSectionPaging().SetDontPage();
                    TopContractsDAL10.Contract conts = new Contract(contractID, CultureIdentifier, dontPage, null, ContractSections.Fields); // Kai Cohen - Modified code to pass paging parameters. -1 tells the method to bring all records.
                    contracts.Add(conts);
                }
                initializingCatalogRecords = false;
            }
            else
            {
                TopContractsDAL10.Contract conts = new Contract(OrganizationIdentifier, "", contractTypeID, 1, UserID, CultureIdentifier);  // 1 is used for default status ID (HardCoded) and "" foe Contractname
                contracts.Add(conts);
            }
            return contracts;
        }

        /// <summary>
        /// Used to check if the ContractID passed is a contract and not an entity.
        /// </summary>
        /// <param action="ContractID">Contract ID that has to be checked if it is a contract.</param>
        /// <returns>Boolean value used to determine if the Contract ID is a contract and not an entity.</returns>
        public static bool IsContract(long ContractID)
        {
            Logger.WriteGeneralVerbose("Contract class - IsContract", "checking if the contract id {0} passed is a contract and not an entity", ContractID);
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
            if (context.Contracts.Any(c => c.ContractID == ContractID && c.ContractType.ParentContractTypeID == ContractTypeContractsID))
                return true;
            else
                return false;
        }
        //Get the Contracts with Contract type ID --Added by deepak dhamija (28/02/2013)
        public static List<long> getContractsbyContractTypeID(long contractTypeID)
        {
            List<Contract> contracts = new List<Contract>();
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            List<long> contractIDs = context.Contracts.Where(cnts => cnts.ContractTypeID == contractTypeID).Select(cnt => cnt.ContractID).ToList();
            return contractIDs;
        }
        //end code

        /// <summary>--Added by Viplav Bhateja (28/02/2013)
        /// Used to get only common field group (this functionality is used for copy contract when user change his current contract type))
        /// </summary>
        /// <param action="ContractTypeID">Contract TypeID is used to get contractfieldgroup according to this contract type.</param>
        /// <param action="ContractToSave">Contract to save is an existing loaded contract so we can inplement a functionality to add only common field group.</param>
        /// <param action="CultureIdentifier">Culture Identifier used for the selection of Fields and Field-Groups 
        /// names in the appropriate language.</param>
        /// <returns></returns>
        public static List<int> getCommonContractFieldGroup(int parentContractTypeID, int childContractTypeID, string CultureIdentifier)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
            TopContractsDAL10.SystemTables.FieldGroups fieldGroups = new SystemTables.FieldGroups();
            List<int> parentFieldGroupIDs = new List<int>();
            List<int> childFieldGroupIDs = new List<int>();
            List<int> commonFieldGroupIDs = new List<int>();
            if (context.ContractTypes.Any(ct => ct.ParentContractTypeID == ContractTypeContractsID && ct.ContractTypeID == parentContractTypeID))
                fieldGroups = SystemTables.FieldGroups.Get(false, false, true, CultureIdentifier);
            else
                fieldGroups = SystemTables.FieldGroups.GetWithoutParentContractTypeID(false, false, true, CultureIdentifier);

            foreach (TopContractsDAL10.SystemTables.FieldGroup fieldGroup in fieldGroups.Entries)
            {
                if (context.ContractTypes.Any(ct => ct.ParentContractTypeID == ContractTypeContractsID && ct.ContractTypeID == parentContractTypeID))
                {
                    if (fieldGroup.ContractTypeIDsVisible.Any(ct => ct == parentContractTypeID) || fieldGroup.VisibleToAllContractTypes)
                        parentFieldGroupIDs.Add((int)fieldGroup.ID);
                }
            }
            foreach (TopContractsDAL10.SystemTables.FieldGroup fieldGroup in fieldGroups.Entries)
            {
                if (context.ContractTypes.Any(ct => ct.ParentContractTypeID == ContractTypeContractsID && ct.ContractTypeID == childContractTypeID))
                {
                    if (fieldGroup.ContractTypeIDsVisible.Any(ct => ct == childContractTypeID) || fieldGroup.VisibleToAllContractTypes)
                        childFieldGroupIDs.Add((int)fieldGroup.ID);
                }
            }
            foreach (int cfg in childFieldGroupIDs)
            {
                if (parentFieldGroupIDs.Any(ctrgroup => ctrgroup == cfg))
                {
                    commonFieldGroupIDs.Add(cfg);
                }
            }
            return commonFieldGroupIDs;
        }

        /// <summary>
        /// This function will check that contract is Normal contract or catalog type.
        /// </summary>
        /// <param name="ContractID"></param>
        /// <returns></returns>
        public static bool IsCatalogTypeContract(long ContractID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            long ContractTypeContractsID = TopContractsDAL10.Utilities.contractTypeContractsID;
            long cTypeId = context.Contracts.FirstOrDefault(t => t.ContractID == ContractID).ContractTypeID;
            return context.ContractTypes.Any(pct => (pct.ParentContractTypeID != ContractTypeContractsID || pct.ParentContractTypeID == null) && pct.ContractTypeID == cTypeId);
        }

        public static void RemoveContractDocsDividerIfAny()
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            if (context.ContractDocs.Any(f => f.ExternalID.Contains(Constants.entityFieldsDivider)))
            {
                foreach (TopContractsEntities.ContractDoc cDoc in context.ContractDocs.Where(f => f.ExternalID.Contains(Constants.entityFieldsDivider)).ToList())
                {
                    cDoc.ExternalID = cDoc.ExternalID.Substring(0, cDoc.ExternalID.IndexOf(Constants.entityFieldsDivider));
                }
            }
            context.SaveChanges();
        }

        /// <summary>
        /// Gets contract users by a specific page size.
        /// </summary>
        /// <param name="ContractID">ID of the contract.</param>
        /// <param name="CultureIdentifier">CultureID in which names are required.</param>
        /// <param name="MaxPageSizeUsers">Number of users to be required.</param>
        /// <returns>List of TopContractsDAL10.ContractUser objects.</returns>
        public List<ContractUser> GetContractUsersByPaging(long ContractID, string CultureIdentifier, long MaxPageSizeUsers)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            List<ContractUser> contractUsers = new List<ContractUser>();
            if (context.Contracts.Any(ct => ct.ContractID == ContractID))
            {
                TopContractsEntities.Contract efContract = context.Contracts.SingleOrDefault(ct => ct.ContractID == ContractID);
                if (efContract.ContractUsers.Count(ct => ct.ContractID == ContractID) <= MaxPageSizeUsers)
                {
                    contractUsers = efContract.ContractUsers.Where(ct => ct.ContractID == ContractID).Select(ca => new ContractUser(ca, CultureIdentifier)).ToList();
                }
                else
                {
                    List<TopContractsEntities.ContractUser> usersWithEditPermissions = new List<TopContractsEntities.ContractUser>();
                    List<TopContractsEntities.ContractUser> usersWithViewPermissions = new List<TopContractsEntities.ContractUser>();
                    bool roleCanEdit = false;
                    //bool roleCanEditGroups = false;
                    //List<ContractUser> contractUsersToFilter = context.ContractUsers.Where(ct => ct.ContractID == ContractID).Select(ca => new ContractUser(ca, CultureIdentifier)).ToList();
                    List<TopContractsEntities.ContractUser> efContractUsers = efContract.ContractUsers.Where(ct => ct.ContractID == ContractID).ToList();

                    List<TopContractsEntities.FieldGroup> efFieldGroups = context.ContractFields.Where(cf => cf.ContractID == ContractID).Select(fg => fg.FieldGroup).Distinct().ToList();

                    foreach (TopContractsEntities.ContractUser efContractUser in efContractUsers)
                    {
                        roleCanEdit = (efContractUser.Role.EditProperties == true || efContractUser.Role.EditActivities == true ||
                                 efContractUser.Role.AddActivities == true || efContractUser.Role.DeleteActivities == true ||
                                 efContractUser.Role.EditTodos == true || efContractUser.Role.AddTodos == true || efContractUser.Role.DeleteTodos == true ||
                                 efContractUser.Role.EditAuth == true || efContractUser.Role.EditDocs == true ||
                                 efContractUser.Role.AddDocs == true || efContractUser.Role.DeleteDocs == true ||
                                 efContractUser.Role.EditApps == true || efContractUser.Role.EditGallery == true ||
                                 efContractUser.Role.AddGallery == true || efContractUser.Role.DeleteGallery == true);

                        roleCanEdit = roleCanEdit || RolePermittedToEditContractFields(efFieldGroups, efContractUser.Role);

                        if (roleCanEdit == true)
                            usersWithEditPermissions.Add(efContractUser);
                        else
                            usersWithViewPermissions.Add(efContractUser);
                    }

                    if (usersWithEditPermissions.Count >= MaxPageSizeUsers)
                        contractUsers.AddRange(usersWithEditPermissions.Take((int)MaxPageSizeUsers).Select(ca => new ContractUser(ca, CultureIdentifier)).ToList());
                    else
                    {
                        contractUsers.AddRange(usersWithEditPermissions.Select(ca => new ContractUser(ca, CultureIdentifier)).ToList());
                        //int usersToAdd = (int)MaxPageSizeUsers - usersWithEditPermissions.Count();
                        contractUsers.AddRange(usersWithViewPermissions.Take((int)MaxPageSizeUsers - usersWithEditPermissions.Count()).Select(ca => new ContractUser(ca, CultureIdentifier)).ToList());
                    }
                }
            }
            return contractUsers;
        }

        /// <summary>
        /// Checks whether a role has permission to edit field groups mapped with a contract.
        /// </summary>
        /// <param name="efFieldGroups">List of TopContractEntities.FieldGroup objects mapped with the contract.</param>
        /// <param name="role">TopContractEntities.Role object required to be checked.</param>
        /// <returns>Boolean value to ensure whether role has permission to edit the field groups mapped with the contract</returns>
        public bool RolePermittedToEditContractFields(List<TopContractsEntities.FieldGroup> efFieldGroups, TopContractsEntities.Role role)
        {
            //bool AllowViewFields = false;
            bool AllowEditFields = false;

            foreach (TopContractsEntities.FieldGroup efFieldGroup in efFieldGroups)
            {
                if (efFieldGroup.RolesVisibility == (byte)FieldGroupRoleVisibility.VisibleToAll)
                {
                    AllowEditFields = true;
                }
                else
                {
                    if (efFieldGroup.FieldGroupsRolesMAPs.Any(ro => ro.RoleID == role.RoleID))
                    {
                        if (efFieldGroup.FieldGroupsRolesMAPs.SingleOrDefault(ro => ro.RoleID == role.RoleID).AllowEdit == true)
                            AllowEditFields = true;

                        //if (efFieldGroup.FieldGroupsRolesMAPs.SingleOrDefault(ro => ro.RoleID == role.RoleID).AllowView == true)
                        //    AllowViewFields = false;
                    }
                }

                if (AllowEditFields == true)
                    break;
            }
            return AllowEditFields;
        }

        /// <summary>
        /// Gets page size value from the AppSettings table in the database.
        /// </summary>
        /// <param name="OrganizationIdentifier">ID of the Orgainzation whose paging size is required.</param>
        /// <param name="contractSection">Contract section whose paging size is required.</param>
        /// <returns>An integer value. Can also be null.</returns>
        public long? GetPagingValueFromDB(Guid OrganizationIdentifier, ContractSections contractSection)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            long? PageSize = null;
            if (context.AppSettings.Any(org => org.OrganizationIdentifier == OrganizationIdentifier))
            {
                AppSetting efAppSettings = context.AppSettings.SingleOrDefault(org => org.OrganizationIdentifier == OrganizationIdentifier);

                switch (contractSection)
                {
                    case ContractSections.AuthorizedEntities:
                        PageSize = efAppSettings.MaxPageSizeUsers;
                        break;
                    case ContractSections.Documents:
                        PageSize = efAppSettings.MaxPageSizeDocs;
                        break;
                    case ContractSections.Events:
                        PageSize = efAppSettings.MaxPageSizeEvents;
                        break;
                    case ContractSections.Gallery:
                        PageSize = efAppSettings.MaxPageSizeGalleries;
                        break;
                    default:
                        break;
                }
            }
            return PageSize;
        }

        /// <summary>
        /// Gets all users of a contract.
        /// </summary>
        /// <param name="ContractID">ID of contract</param>
        /// <param name="CultureIdentifier">Culture identifier to be used to retrieve users information</param>
        /// <returns>List of TopContractsDAL10.ContractUser objects.</returns>
        public List<ContractUser> GetAllContractUsers(long ContractID, string CultureIdentifier)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            List<ContractUser> users = new List<ContractUser>();

            if (context.Contracts.Any(cu => cu.ContractID == ContractID))
            {
                TopContractsEntities.Contract efContract = context.Contracts.SingleOrDefault(cu => cu.ContractID == ContractID);
                users.AddRange(efContract.ContractUsers.Select(ca => new ContractUser(ca, CultureIdentifier)));
            }

            return users;
        }

        /// <summary>
        /// Gets names of contracts by using IDs of the contracts
        /// </summary>
        /// <param name="ContractIDs">IDs of the contracts.</param>
        /// <returns>List of TopContractsDAL10.ContractInfo objects containing names and Ids of the contracts.</returns>
        public List<ContractInfo> GetContractsInfo(List<long> ContractIDs)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            List<ContractInfo> contractsInfo = new List<ContractInfo>();

            contractsInfo.AddRange(context.Contracts.Where(c => ContractIDs.Contains(c.ContractID)).Select(c => new ContractInfo { ContractID = c.ContractID, Name = c.Name }));

            return contractsInfo;
        }

        /// <summary>
        /// Gets all Properties of a contract.
        /// </summary>
        /// <param name="CultureIdentifier">Culture identifier to be used to retrieve users information</param>
        /// <returns>List of TopContractsDAL10.ContractUser objects.</returns>
        public Dictionary<long, ContractProperties> GetAllContractProperties(string CultureIdentifier)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            Dictionary<long, ContractProperties> contractProperties = new Dictionary<long, ContractProperties>();

            foreach (TopContractsEntities.Contract contract in context.Contracts)
            {
                ContractProperties cntprop = new ContractProperties();
                cntprop.initDataFields(contract);
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Data Fields initialized");
                cntprop.initPrivateFields(contract, CultureIdentifier);
                Logger.WriteGeneralVerbose("Contract class - CTOR 2", "Private Fields initialized");
                contractProperties.Add(contract.ContractID, cntprop);
            }
            return contractProperties;
        }

        /// <summary>
        /// find shared groups (groups shared by all contracts)
        /// </summary>
        /// <param name="contractIds">List of contract IDs - this list will be checked, so that only groups
        /// shared by all these contracts will be returned</param>
        /// <param name="fieldGroupIDsToUse">
        /// Optional parameter; If provided, it acts as a filter - any field groups not contained in this filter, will
        /// be removed from the shared group list. Example, if shared group was found to contain IDs 1,5,7,8 and the
        /// filter is 2,5,8 then only 5,8 will be returned
        /// </param>
        /// <returns></returns>
        public static List<long> GetAllSharedGroupIDs(List<long> contractIds, List<long> fieldGroupIDsToUse = null)
        {
            List<long> sharedGroupIDs = new List<long>();


            if (fieldGroupIDsToUse != null)
                if (fieldGroupIDsToUse.Count == 0)
                    return sharedGroupIDs;

            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            //First find all groups of all contracts (distinct); example, if contract A contains 1,2,3
            //and contract B contains 2,3,7, then the list is 1,2,3,7
            sharedGroupIDs = context.ContractFields.Where(cf => contractIds.Contains(cf.ContractID)).Select(cf => cf.FieldGroupID).Distinct().ToList();

            //now remove any group missing from at least one of the contracts (or from the filter list)
            for (int indx = sharedGroupIDs.Count - 1; indx >= 0; indx--)
            {
                long sharedGroupID = sharedGroupIDs[indx];
                bool removed = false;
                //If filter exists, and does not contain field-group ID - remove it...
                if (fieldGroupIDsToUse != null)
                    if (fieldGroupIDsToUse.Any(ftu => ftu == sharedGroupID) == false)
                    {
                        sharedGroupIDs.RemoveAt(indx);
                        removed = true;
                    }

                if (removed == false)
                    foreach (long contractID in contractIds)
                    {
                        if (context.ContractFields.Any(cf => cf.ContractID == contractID && cf.FieldGroupID == sharedGroupID) == false)
                        {
                            sharedGroupIDs.RemoveAt(indx);
                            break;
                        }
                    }
            }
            return sharedGroupIDs;
        }
    }


    /// <summary>
    /// Contains precise information of contract. It will be used by dashboard button to add new record in any contract.
    /// </summary>
    public class ContractInfo
    {
        /// <summary>
        /// Contract ID
        /// </summary>
        public long ContractID { get; set; }

        /// <summary>
        /// ID of the Contract
        /// </summary>
        public string Name { get; set; }
    }
}
