using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TopContractsEntities;
using TopContractsCommon10;
using TopContractsCommon10.Configuration.Sections;
using TopContractsCommon10.Configuration;
using System.Data.Entity.Validation;
using TopContractsDAL10.SystemTables;
using System.Data.Objects;
using System.Data.Entity.Infrastructure;
using TopContractsCommon10.Diagnostics;
using TopContractsStorage;
using System.IO;
using TopContractsDAL10.DasboardTables;
using System.Data;

namespace TopContractsDAL10
{
    public class DataHandler
    {
        private System.Guid organizationIdentifier = System.Guid.Empty;

        public DataHandler(System.Guid OrganizationIdentifier)
        {
            organizationIdentifier = OrganizationIdentifier;
        }

        private void CheckUserExists(TopContractsV01Entities context, int UserID, string MsgToThrow)
        {
            if (context.Users.Count(u => u.UserID == UserID) != 1)
                throw new Exception(MsgToThrow);
        }

        public int Save(Users Data, bool IsWebHosted, ref Dictionary<string, string> updatedUserRecords)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.User efUser = null;
            foreach (TopContractsDAL10.SystemTables.User user in Data.Entries)
            {
                if (user.New)
                {
                    efUser = new TopContractsEntities.User();
                }
                else
                {
                    efUser = context.Users.Where(c => c.UserID == user.ID).SingleOrDefault();
                }

                if (user.Deleted == false)
                {
                    efUser.AddContracts = user.AddContracts;
                    efUser.DefaultRoleID = user.DefaultRoleID;
                    efUser.DeleteContracts = user.DeleteContracts;
                    efUser.AccessIdentifier = user.AccessIdentifier;
                    efUser.UICutlture = user.DefaultCultureIdentifier.Trim();
                    efUser.eMail1 = user.eMail1;
                    efUser.eMail2 = user.eMail2;
                    efUser.FirstName = user.FirstName;
                    efUser.LastName = user.LastName;
                    efUser.MiddleName = user.MiddleName;
                    efUser.Phone1 = user.Phone1;
                    efUser.Phone2 = user.Phone2;
                    efUser.SuperAdmin = user.SuperAdmin;
                    efUser.SysAdmin = user.SysAdmin;
                    efUser.Unrestricted = user.Unrestricted;
                    efUser.Title = user.Title;
                    efUser.UnitID = user.UnitID;
                    efUser.OrganizationIdentifier = this.organizationIdentifier;
                }

                if (user.New)
                    context.Users.Add(efUser);
                else
                {
                    if (user.Deleted && efUser != null)
                    {
                        //Boaz - 13-December-2012
                        foreach (TopContractsEntities.DoneTodo doneTodo in context.DoneTodos.Where(ent => ent.UserID == efUser.UserID))
                            context.DoneTodos.Remove(doneTodo);
                        foreach (TopContractsEntities.ContractTodoRecipient contractTodoRecipient in context.ContractTodoRecipients.Where(ent => ent.UserID == efUser.UserID))
                            context.ContractTodoRecipients.Remove(contractTodoRecipient);
                        //----------
                        //Viplav - 30-Nov-2013
                        foreach (TopContractsEntities.UserUiPref useruipref in context.UserUiPrefs.Where(ent => ent.UserId == efUser.UserID))
                            context.UserUiPrefs.Remove(useruipref);
                        //-----------

                        // Kai Cohen - 05-Dec-2013 - Removes this users entry from Auth DB in case of Web application
                        //if (IsWebHosted)
                        //    RemoveUserEntryFromAuthDB(efUser);
                        //--------------------
                        context.Users.Remove(efUser);
                    }
                }
            }

            int rowsAffected = 0;
            if (IsWebHosted == false)
            {
                rowsAffected = context.SaveChanges();
            }
            else
            {
                ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
                objectContext.DetectChanges();

                rowsAffected = objectContext.SaveChanges(SaveOptions.None); //This will fill the IDs with new values, needed for the next part...

                long changesOccurred = 0;
                foreach (var newField in context.ChangeTracker.Entries())
                {
                    if (newField.Entity is TopContractsEntities.User)
                    {
                        if (newField.State == System.Data.EntityState.Modified)
                        {
                            if (newField.OriginalValues["AccessIdentifier"].ToString() != newField.CurrentValues["AccessIdentifier"].ToString())
                            {
                                if (newField.OriginalValues["AccessIdentifier"].ToString() != newField.CurrentValues["AccessIdentifier"].ToString())
                                    updatedUserRecords.Add(newField.OriginalValues["AccessIdentifier"].ToString(), newField.CurrentValues["AccessIdentifier"].ToString());
                            }

                            changesOccurred += 1;
                        }
                        else if (newField.State == System.Data.EntityState.Added)
                            changesOccurred += 1;
                        //AddUserEntryInAuthDB(newField.Entity as TopContractsEntities.User);
                        else if (newField.State == System.Data.EntityState.Deleted)
                            changesOccurred += 1;
                    }
                }

                if (changesOccurred > 0)
                    ApplicationCachedData.UpdateContractDisplayCacheTicks();

                objectContext.AcceptAllChanges();
            }
            return rowsAffected;
        }

        public int Save(ContractTypes Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.ContractType efContractType = null;
            foreach (TopContractsDAL10.SystemTables.ContractType contractType in Data.Entries)
            {
                if (contractType.New)
                {
                    efContractType = new TopContractsEntities.ContractType();
                    //efContractType.ParentContractTypeID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;  //This parent value is used to save ContractParentID in database to make every new ContractType as Contracts
                    efContractType.ParentContractTypeID = Utilities.contractTypeContractsID;  // Code implemented by Viplav on 17 june 2013 for remove webconfig concept.
                }
                else
                {
                    efContractType = context.ContractTypes.Where(c => c.ContractTypeID == contractType.ID).SingleOrDefault();
                }

                if (contractType.Deleted == false)
                {
                    efContractType.InitCommonFields(efContractType, contractType, efContractType.ContractTypesLNGs, this.organizationIdentifier);
                    //efContractType.SelectorFieldID = contractType.SelectorField; // To be used in case of entities
                }

                if (contractType.New)
                    context.ContractTypes.Add(efContractType);
                else
                {
                    if (contractType.Deleted && efContractType != null)
                    {
                        efContractType.DeleteLanguageEntries(efContractType, context.ContractTypesLNGs, efContractType.ContractTypesLNGs);
                        context.ContractTypes.Remove(efContractType);
                    }
                }
            }
            return context.SaveChanges();
        }

        public int Save(Currencies Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            TopContractsEntities.Currency efCurrency = null;
            foreach (TopContractsDAL10.SystemTables.Currency Currency in Data.Entries)
            {
                if (Currency.New)
                {
                    efCurrency = new TopContractsEntities.Currency();
                }
                else
                {
                    efCurrency = context.Currencies.Where(c => c.CurrencyID == Currency.ID).SingleOrDefault();
                }
                if (Currency.Deleted == false)
                {
                    efCurrency.InitCommonFields(efCurrency, Currency, efCurrency.CurrenciesLNGs, this.organizationIdentifier);
                    efCurrency.Rate = Currency.Rate;
                    efCurrency.RateDate = Currency.RateDate;
                }

                if (Currency.New)
                {
                    context.Currencies.Add(efCurrency);
                }
                else
                {
                    if (Currency.Deleted && efCurrency != null)
                    {
                        efCurrency.DeleteLanguageEntries(efCurrency, context.CurrenciesLNGs, efCurrency.CurrenciesLNGs);
                        //for (int indx = efCurrency.CurrenciesLNGs.Count() - 1; indx >= 0; indx--)
                        //{
                        //    TopContractsEntities.CurrenciesLNG lng = efCurrency.CurrenciesLNGs.ElementAt(indx);
                        //    context.CurrenciesLNGs.Remove(lng);
                        //}
                        context.Currencies.Remove(efCurrency);
                    }
                }

            }
            return context.SaveChanges();
        }

        public int Save(CurrencyRates Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            TopContractsEntities.CurrencyConversionRate efCurrency = null;
            foreach (TopContractsDAL10.SystemTables.CurrencyRate Currency in Data.Entries)
            {
                if (Currency.New)
                {
                    efCurrency = new TopContractsEntities.CurrencyConversionRate();
                }
                else
                {
                    efCurrency = context.CurrencyConversionRates.Where(c => c.CurrencyConversionRatesID == Currency.ID).SingleOrDefault();
                }
                if (Currency.Deleted == false)
                {
                    efCurrency.OrganizationIdentifier = this.organizationIdentifier;
                    efCurrency.CurrencyID = Currency.CurrencyID;
                    efCurrency.Rate = Currency.Rate;
                    efCurrency.RateDate = Convert.ToDateTime(Currency.RateDate);
                    efCurrency.DateCreated = DateTime.Now;
                }

                if (Currency.New)
                {
                    context.CurrencyConversionRates.Add(efCurrency);
                }
                else
                {
                    if (Currency.Deleted && efCurrency != null)
                    {
                        context.CurrencyConversionRates.Remove(efCurrency);
                    }
                }

            }
            return context.SaveChanges();
        }

        public int Save(EventTypes Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.EventType efEventType = null;
            foreach (TopContractsDAL10.SystemTables.EventType EventType in Data.Entries)
            {
                if (EventType.New)
                {
                    efEventType = new TopContractsEntities.EventType();
                }
                else
                {
                    efEventType = context.EventTypes.Where(c => c.EventTypeID == EventType.ID).SingleOrDefault();
                }

                if (EventType.Deleted == false)
                    efEventType.InitCommonFields(efEventType, EventType, efEventType.EventTypesLNGs, this.organizationIdentifier);

                if (EventType.New)
                    context.EventTypes.Add(efEventType);
                else
                {
                    if (EventType.Deleted && efEventType != null)
                    {
                        efEventType.DeleteLanguageEntries(efEventType, context.EventTypesLNGs, efEventType.EventTypesLNGs);
                        //for (int indx = efEventType.EventTypesLNGs.Count() - 1; indx >= 0; indx--)
                        //{
                        //    TopContractsEntities.EventTypesLNG lng = efEventType.EventTypesLNGs.ElementAt(indx);
                        //    context.EventTypesLNGs.Remove(lng);
                        //}
                        context.EventTypes.Remove(efEventType);
                    }
                }
            }
            return context.SaveChanges();
        }

        public int Save(MsgTypes Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.MsgType efMsgType = null;
            foreach (TopContractsDAL10.SystemTables.MsgType MsgType in Data.Entries)
            {
                if (MsgType.New)
                {
                    efMsgType = new TopContractsEntities.MsgType();
                }
                else
                {
                    efMsgType = context.MsgTypes.Where(c => c.MsgTypeID == MsgType.ID).SingleOrDefault();
                }

                if (MsgType.Deleted == false)
                {
                    efMsgType.InitCommonFields(efMsgType, MsgType, efMsgType.MsgTypesLNGs, this.organizationIdentifier);
                    efMsgType.ContractTypesVisibility = MsgType.ContractTypesVisibility;
                    efMsgType.IncludeID1Body = MsgType.IncludeID1Body;
                    efMsgType.IncludeID1Subject = MsgType.IncludeID1Subject;
                    efMsgType.IncludeID2Body = MsgType.IncludeID2Body;
                    efMsgType.IncludeID2Subject = MsgType.IncludeID2Subject;
                    efMsgType.IncludeNameBody = MsgType.IncludeNameBody;
                    efMsgType.IncludeNameSubject = MsgType.IncludeNameSubject;
                    efMsgType.IncludeSysCodeBody = MsgType.IncludeSysCodeBody;
                    efMsgType.IncludeSysCodeSubject = MsgType.IncludeSysCodeSubject;
                    efMsgType.LinkInBody = MsgType.LinkInBody;
                    efMsgType.LinkInSubject = MsgType.LinkInSubject;
                    efMsgType.MsgBodyPrefix = MsgType.MsgBodyPrefix;
                    efMsgType.MsgSubjectPrefix = MsgType.MsgSubjectPrefix;
                }
                if (MsgType.New)
                    context.MsgTypes.Add(efMsgType);
                else
                {
                    if (MsgType.Deleted && efMsgType != null)
                    {
                        efMsgType.DeleteLanguageEntries(efMsgType, context.MsgTypesLNGs, efMsgType.MsgTypesLNGs);
                        //for (int indx = efMsgType.MsgTypesLNGs.Count() - 1; indx >= 0; indx--)
                        //{
                        //    TopContractsEntities.MsgTypesLNG lng = efMsgType.MsgTypesLNGs.ElementAt(indx);
                        //    context.MsgTypesLNGs.Remove(lng);
                        //}
                        context.MsgTypes.Remove(efMsgType);
                    }
                }
            }
            return context.SaveChanges();
        }

        /// <summary>
        /// Saving the applications table 
        /// </summary>
        /// <param action="Data"></param>
        /// <returns></returns>
        public int Save(Applications Data)
        {
            int result = 0;
            try
            {
                TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
                TopContractsEntities.Application efApplication = null;

                //to avoid duplicacy of application action
                if (Data.Entries.Where(ent => ent.Deleted == false).Select(ent => ent.ApplicationName).Distinct().Count() < Data.Entries.Where(ent => ent.Deleted == false).Select(ent => ent.ApplicationName).Count())
                    throw new ExceptionDataAdminSaveDuplicateApplicationName();

                foreach (TopContractsDAL10.Application Application in Data.Entries)
                {
                    if (Application.New)
                        efApplication = new TopContractsEntities.Application();
                    else
                        efApplication = context.Applications.Where(c => c.ApplicationID == Application.ApplicationID).SingleOrDefault();

                    if (Application.Deleted == false)
                    {
                        efApplication.InitCommonFields(efApplication, Application, this.organizationIdentifier);
                        efApplication.ApplicationID = Application.ApplicationID;
                        efApplication.ApplicationName = Application.ApplicationName;
                        efApplication.URLContract = Application.URLContract;
                        efApplication.URLContractActivity = Application.URLContractActivity;
                        efApplication.URLContractDoc = Application.URLContractDoc;
                        efApplication.URLContractField = Application.URLContractField;
                        efApplication.URLContractTodo = Application.URLContractTodo;
                        efApplication.URLContractUser = Application.URLContractUser;
                        efApplication.OrganizationIdentifier = this.organizationIdentifier;
                    }
                    if (Application.New)
                        context.Applications.Add(efApplication);
                    else
                    {
                        if (Application.Deleted && efApplication != null)
                        {
                            context.Applications.Remove(efApplication);
                        }
                    }
                }
                result = context.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex.InnerException.ToString().Contains("FK_ContractApplications_Applications"))
                    throw new ExceptionDataAdminSaveDeleteApplicationWithContract();
            }
            return result;
        }

        public int Save(Statuses Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Status efStatus = null;
            foreach (TopContractsDAL10.SystemTables.Status Status in Data.Entries)
            {
                if (Status.New)
                {
                    efStatus = new TopContractsEntities.Status();
                }
                else
                {
                    efStatus = context.Statuses.Where(c => c.StatusID == Status.ID).SingleOrDefault();
                }

                if (Status.Deleted == false)
                    efStatus.InitCommonFields(efStatus, Status, efStatus.StatusesLNGs, this.organizationIdentifier);

                if (Status.New)
                    context.Statuses.Add(efStatus);
                else
                {
                    if (Status.Deleted && efStatus != null)
                    {
                        efStatus.DeleteLanguageEntries(efStatus, context.StatusesLNGs, efStatus.StatusesLNGs);
                        //for (int indx = efStatus.StatusesLNGs.Count() - 1; indx >= 0; indx--)
                        //{
                        //    TopContractsEntities.StatusesLNG lng = efStatus.StatusesLNGs.ElementAt(indx);
                        //    context.StatusesLNGs.Remove(lng);
                        //}
                        context.Statuses.Remove(efStatus);
                    }
                }
            }
            return context.SaveChanges();
        }

        /// <summary>
        /// Save the modified or newly added roles into the database
        /// </summary>
        /// <param action="Data">List of roles to be saved</param>
        /// <returns></returns>
        public int Save(Roles Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.Role efRole = null;
            foreach (TopContractsDAL10.SystemTables.Role Role in Data.Entries)
            {
                if (Role.New)
                {
                    efRole = new TopContractsEntities.Role();
                }
                else
                {
                    efRole = context.Roles.Where(c => c.RoleID == Role.ID).SingleOrDefault();
                }

                if (efRole != null)
                {
                    if (Role.CanEdit == true && efRole.Users.Any(u => u.Unrestricted == false))
                    {
                        throw new ExceptionSecurityAdminSaveRoleAssignedToRestrictedUser();
                    }
                }

                if (Role.Deleted == false)
                {
                    efRole.InitCommonFields(efRole, Role, efRole.RolesLNGs, this.organizationIdentifier);
                    efRole.AddActivities = Role.AddActivities;
                    efRole.AddDocs = Role.AddDocs;
                    efRole.AddTodos = Role.AddTodos;
                    efRole.DeleteActivities = Role.DeleteActivities;
                    efRole.DeleteDocs = Role.DeleteDocs;
                    efRole.DeleteTodos = Role.DeleteTodos;
                    efRole.DisplayOrder = Role.DisplayOrder;
                    efRole.EditActivities = Role.EditActivities;
                    efRole.EditApps = Role.EditApps;
                    efRole.EditAuth = Role.EditAuth;
                    efRole.EditDocs = Role.EditDocs;
                    efRole.EditProperties = Role.EditProperties;
                    efRole.EditTodos = Role.EditTodos;
                    efRole.ModifyActivitiesOfOthers = Role.ModifyActivitiesOfOthers;
                    efRole.ModifyDocsOfOthers = Role.ModifyDocsOfOthers;
                    efRole.ModifyTodosOfOthers = Role.ModifyTodosOfOthers;
                    efRole.ViewActivities = Role.ViewActivities;
                    efRole.ViewActivitiesOfOthers = Role.ViewActivitiesOfOthers;
                    efRole.ViewApps = Role.ViewApps;
                    efRole.ViewAuth = Role.ViewAuth;
                    efRole.ViewDocs = Role.ViewDocs;
                    efRole.ViewDocsOfOthers = Role.ViewDocsOfOthers;

                    efRole.ViewProperties = true;   // Role.ViewProperties;     //HardCoded value true entered for roles in every condition on 6-Mar-2013

                    efRole.ViewTodos = Role.ViewTodos;
                    efRole.ViewTodosOfOthers = Role.ViewTodosOfOthers;
                    efRole.EditFields = Role.EditFields;    // Added by Viplav on 7 Mar 2013 for implementing limited roles functionality
                    //******************************************************************
                    // New Properties Add for Image Gallery on 23-April-2013 by Viplav
                    //******************************************************************
                    efRole.ViewGallery = Role.ViewGallery;
                    efRole.EditGallery = Role.EditGallery;
                    efRole.AddGallery = Role.AddGallery;
                    efRole.DeleteGallery = Role.DeleteGallery;
                    efRole.ViewGalleryOfOthers = Role.ViewGalleryOfOthers;
                    efRole.ModifyGalleryOfOthers = Role.ModifyGalleryOfOthers;

                }
                if (Role.New)
                    context.Roles.Add(efRole);
                else
                {
                    if (Role.Deleted && efRole != null)
                    {
                        //******************Condition Implemented for delete entry from FieldGroupsRolesMAP by Viplav on 15-Oct-2013********//
                        if (context.FieldGroupsRolesMAPs.Any(ent => ent.RoleID == efRole.RoleID))
                        {
                            List<FieldGroupsRolesMAP> FieldGroupsRoleMap = context.FieldGroupsRolesMAPs.Where(t => t.RoleID == efRole.RoleID).ToList();
                            foreach (FieldGroupsRolesMAP item in FieldGroupsRoleMap)
                                context.FieldGroupsRolesMAPs.Remove(item);
                        }
                        //********************************************************************************************************************
                        efRole.DeleteLanguageEntries(efRole, context.RolesLNGs, efRole.RolesLNGs);
                        context.Roles.Remove(efRole);
                    }
                }
            }
            //int Roweffected = context.SaveChanges();
            ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
            objectContext.DetectChanges();

            int Roweffected = objectContext.SaveChanges(SaveOptions.None);

            bool structuralChangeOccurred = false;
            long nonStructuralChanges = 0;

            foreach (var changedEntry in context.ChangeTracker.Entries())
            {
                if (changedEntry.Entity is TopContractsEntities.Role && changedEntry.State == System.Data.EntityState.Modified)
                {
                    structuralChangeOccurred = IsRolePermissionsChanged(changedEntry);
                    if (structuralChangeOccurred == false)
                        nonStructuralChanges += 1;
                }
                else if (changedEntry.Entity is TopContractsEntities.Role && changedEntry.State == System.Data.EntityState.Added)
                    nonStructuralChanges += 1;
                else if (changedEntry.Entity is TopContractsEntities.Role && changedEntry.State == System.Data.EntityState.Deleted)
                    nonStructuralChanges += 1;
                else if (changedEntry.Entity is TopContractsEntities.RolesLNG && changedEntry.State == System.Data.EntityState.Modified)
                    nonStructuralChanges += 1;
                //else if (changedEntry.Entity is TopContractsEntities.RolesLNG && changedEntry.State == System.Data.EntityState.Modified)
                //    nonStructuralChanges += 1;
            }

            objectContext.AcceptAllChanges();

            // We use a default value 1 for check that only a single limited role is exist in the role table
            if ((context.Roles.Count(rol => rol.EditFields == true) == 1) && context.FieldGroups.Any(fldgrp => fldgrp.RolesVisibility == (byte)FieldGroupRoleVisibility.VisibleToAll))
                SaveFieldGroupsRolesMAPforLimitedUser();

            ApplicationCachedData.reInitCacheData(); // To re-initialize server side cache.

            if (structuralChangeOccurred)
                ApplicationCachedData.UpdateContractStructureCacheTicks();
            else
                if (nonStructuralChanges > 0)
                    ApplicationCachedData.UpdateContractDisplayCacheTicks();

            return Roweffected;
        }
        public int Save(SaveSearchs Data, int UpdatingUserID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            TopContractsEntities.SaveSearch efSaveSearch = null;
            TopContractsEntities.SearchResultsContract efSaveContracts = null;
            foreach (TopContractsDAL10.DasboardTables.SaveSearch svSearch in Data.Entries)
            {
                if (svSearch.New)
                {
                    efSaveSearch = new TopContractsEntities.SaveSearch();
                }
                else
                {
                    efSaveSearch = context.SaveSearches.Where(c => c.SearchId == svSearch.ID).SingleOrDefault();
                }
                if (svSearch.Deleted == false)
                {
                    efSaveSearch.DisplayOrder = svSearch.DisplayOrder;
                    efSaveSearch.Description = svSearch.Description;
                    efSaveSearch.Name = svSearch.Name;
                    efSaveSearch.ExternalID = svSearch.ExternalID;
                    efSaveSearch.SearchQuery = svSearch.SearchQuery;
                    efSaveSearch.Inactive = svSearch.Inactive;
                    efSaveSearch.Locked = svSearch.Locked;
                    efSaveSearch.OrganizationIdentifier = this.organizationIdentifier;
                    foreach (TopContractsDAL10.DasboardTables.SearchResultsContract svContracts in svSearch.searchResultsContracts.Entries)
                    {
                        if (svContracts.New)
                        {
                            efSaveContracts = new TopContractsEntities.SearchResultsContract();
                        }
                        else
                        {
                            efSaveContracts = context.SearchResultsContracts.Where(c => c.SearchContractId == svContracts.ID).SingleOrDefault();
                        }
                        if (svContracts.Deleted == false)
                        {
                            efSaveContracts.SearchId = svContracts.SearchId;
                            efSaveContracts.ContractId = svContracts.ContractId;
                        }
                        if ((svContracts.New == true && svContracts.Deleted == false) || (svContracts.New == false && svContracts.Deleted == true))
                        {
                            if (svContracts.New)
                                efSaveSearch.SearchResultsContracts.Add(efSaveContracts);
                            else
                            {
                                if (svContracts.Deleted && efSaveContracts != null)
                                {
                                    efSaveSearch.SearchResultsContracts.Remove(efSaveContracts);
                                    context.SearchResultsContracts.Remove(efSaveContracts);
                                }
                            }
                        }
                    }
                }
                if (svSearch.New)
                {
                    context.SaveSearches.Add(efSaveSearch);
                }
                else
                {
                    if (svSearch.Deleted && efSaveSearch != null)
                    {
                        foreach (TopContractsDAL10.DasboardTables.SearchResultsContract svContracts in svSearch.searchResultsContracts.Entries)
                        {
                            efSaveContracts = context.SearchResultsContracts.Where(c => c.SearchContractId == svContracts.ID).SingleOrDefault();
                            context.SearchResultsContracts.Remove(efSaveContracts);
                        }
                        context.SaveSearches.Remove(efSaveSearch);
                    }
                }

            }
            bool updateSavedSearchDetails = false;
            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified)
                {
                    updateSavedSearchDetails = true;
                }
            }
            if (updateSavedSearchDetails)
                foreach (var entry in context.ChangeTracker.Entries())
                {
                    if (entry.Entity is TopContractsEntities.SaveSearch && (entry.State == EntityState.Added || entry.State == EntityState.Modified))
                    {
                        ((TopContractsEntities.SaveSearch)entry.Entity).UpdateDate = DateTime.Now;
                        ((TopContractsEntities.SaveSearch)entry.Entity).UpdateUserID = UpdatingUserID;
                    }
                }
            return context.SaveChanges();
        }
        /// <summary>
        /// Save the field groups and its fields into the database.
        /// </summary>
        /// <param action="Data">Collection of field groups which are getting saved.</param>
        /// <param action="AuditChanges">A boolean value equal to true, if application license allows audit changes.</param>
        /// <param action="UpdatingUserID">Id of the user who is updating the field groups.</param>
        /// <param action="CascadeDelete">Boolean value if cascade deletion is bieng done.</param>
        /// <returns>Returns an integer value for the total number of records being updated.</returns>
        //public static int SaveFields(FieldGroups Data, bool AuditChanges, long UpdatingUserID, bool CascadeDelete)
        public int SaveFields(FieldGroups Data, bool AuditChanges, long UpdatingUserID, bool CascadeDelete, ref Dictionary<int, long> EntityFieldIDsMap, bool isCatalogField, bool populateMapDictionary = false)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.FieldGroup efFieldGroup = null;
            Dictionary<long, long> checkMax = new Dictionary<long, long>();
            TopContractsEntities.Field efField = null;
            TopContractsEntities.FieldListItem efFieldListItem = null;
            foreach (TopContractsDAL10.SystemTables.FieldGroup fieldGroup in Data.Entries)
            {
                if (fieldGroup.New)
                {
                    efFieldGroup = new TopContractsEntities.FieldGroup();
                }
                else
                {
                    efFieldGroup = context.FieldGroups.Where(c => c.FieldGroupID == fieldGroup.ID).SingleOrDefault();
                }

                if (fieldGroup.Deleted == false)
                {
                    efFieldGroup.InitCommonFields(efFieldGroup, fieldGroup, efFieldGroup.FieldGroupsLNGs, this.organizationIdentifier);
                    efFieldGroup.DisplayIndependent = fieldGroup.DisplayIndependent;

                    if (fieldGroup.VisibleToAllContractTypes)
                    {
                        efFieldGroup.ContractTypeVisibility = (byte)FieldGroupContractTypeVisibility.VisibleToAll;
                        if (efFieldGroup.FieldGroupsContractTypesMAPs != null)
                        {
                            for (int i = efFieldGroup.FieldGroupsContractTypesMAPs.Count - 1; i >= 0; i--)
                            {
                                FieldGroupsContractTypesMAP map = efFieldGroup.FieldGroupsContractTypesMAPs.ElementAt(i);
                                efFieldGroup.FieldGroupsContractTypesMAPs.Remove(map);
                                context.FieldGroupsContractTypesMAPs.Remove(map);
                            }
                        }
                    }
                    else
                    {   //TODO - add implementation for FieldGroupContractTypeVisibility.HiddenFromTypes
                        efFieldGroup.ContractTypeVisibility = (byte)FieldGroupContractTypeVisibility.VisibleToTypes;
                        if (efFieldGroup.FieldGroupsContractTypesMAPs != null)
                        {
                            //Removing those who are missing from the received list
                            for (int i = efFieldGroup.FieldGroupsContractTypesMAPs.Count - 1; i >= 0; i--)
                            {
                                FieldGroupsContractTypesMAP map = efFieldGroup.FieldGroupsContractTypesMAPs.ElementAt(i);
                                if (fieldGroup.ContractTypeIDsVisible != null)
                                {
                                    if (fieldGroup.ContractTypeIDsVisible.Any(v => v == map.ContractTypeID) == false)
                                    {
                                        if (CascadeDelete)
                                        {
                                            foreach (TopContractsEntities.Contract contract in map.ContractType.Contracts)
                                            {
                                                foreach (TopContractsEntities.Field fld in efFieldGroup.Fields)
                                                {
                                                    //Changed by Boaz 16-05-2013: field-id is not used properly in case of catalog-fields - it should be replaced with the "fld.ContractType.SelectorFieldID" for the deletion purpose
                                                    long fieldID = getFieldIdForContractFields(fld);
                                                    if (fld.FieldType == (long)FieldTypes.EntityLink)
                                                    {
                                                        if (contract.ContractFields.Any(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID && cf.CatalogFieldID == fieldID))
                                                        {
                                                            foreach (long recordCounter in contract.ContractFields.Where(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID && cf.CatalogFieldID == fieldID).Select(u => u.RecordCounter).ToList())
                                                            {
                                                                context.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID && cf.CatalogFieldID == fieldID && cf.RecordCounter == recordCounter));
                                                            }
                                                        }
                                                        //context.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID && cf.CatalogFieldID == fieldID));
                                                    }
                                                    else
                                                    {
                                                        if (contract.ContractFields.Any(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID))
                                                        {
                                                            foreach (long recordCounter in contract.ContractFields.Where(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fld.FieldID).Select(u => u.RecordCounter).ToList())
                                                            {
                                                                context.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fieldID && cf.RecordCounter == recordCounter));
                                                            }
                                                        }
                                                        //context.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldGroupID == fld.FieldGroupID && cf.FieldID == fieldID ));
                                                    }
                                                }
                                            }
                                        }
                                        efFieldGroup.FieldGroupsContractTypesMAPs.Remove(map);
                                        context.FieldGroupsContractTypesMAPs.Remove(map);
                                    }
                                }
                                else
                                {
                                    if (CascadeDelete)
                                    {
                                        foreach (TopContractsEntities.Contract contract in map.ContractType.Contracts)
                                        {
                                            for (int j = contract.ContractFields.Count - 1; j >= 0; j--)
                                            {
                                                contract.ContractFields.Remove(contract.ContractFields.ElementAt(j));
                                            }
                                        }
                                    }
                                    efFieldGroup.FieldGroupsContractTypesMAPs.Remove(map);
                                    context.FieldGroupsContractTypesMAPs.Remove(map);
                                }
                            }

                        }
                        //Adding entries from the received list which don't exist yet
                        if (fieldGroup.ContractTypeIDsVisible != null)
                        {
                            foreach (int indx in fieldGroup.ContractTypeIDsVisible)
                                if (efFieldGroup.FieldGroupsContractTypesMAPs.Any(v => v.ContractTypeID == indx) == false)
                                    efFieldGroup.FieldGroupsContractTypesMAPs.Add(new FieldGroupsContractTypesMAP() { OrganizationIdentifier = this.organizationIdentifier, ContractTypeID = indx, FieldGroupID = (int)fieldGroup.ID });
                        }
                    }

                    if (fieldGroup.VisibleToAllRoles)
                    {
                        efFieldGroup.RolesVisibility = (byte)FieldGroupRoleVisibility.VisibleToAll;
                        if (efFieldGroup.FieldGroupsRolesMAPs != null)
                        {
                            for (int i = efFieldGroup.FieldGroupsRolesMAPs.Count - 1; i >= 0; i--)
                            {
                                FieldGroupsRolesMAP map = efFieldGroup.FieldGroupsRolesMAPs.ElementAt(i);
                                efFieldGroup.FieldGroupsRolesMAPs.Remove(map);
                                context.FieldGroupsRolesMAPs.Remove(map);
                            }
                        }
                    }
                    else
                    {   //TODO - add implementation for FieldGroupRoleVisibility.HiddenFromRoles
                        efFieldGroup.RolesVisibility = (byte)FieldGroupRoleVisibility.VisibleToRoles;
                        if (efFieldGroup.FieldGroupsRolesMAPs != null)
                        {
                            //Removing those who are missing from the received list
                            for (int i = efFieldGroup.FieldGroupsRolesMAPs.Count - 1; i >= 0; i--)
                            {
                                FieldGroupsRolesMAP map = efFieldGroup.FieldGroupsRolesMAPs.ElementAt(i);
                                if (fieldGroup.RoleIDsVisible != null)
                                {
                                    if (fieldGroup.RoleIDsVisible.Any(v => v == map.RoleID) == false)
                                    {
                                        efFieldGroup.FieldGroupsRolesMAPs.Remove(map);
                                        context.FieldGroupsRolesMAPs.Remove(map);
                                    }
                                }
                                else
                                {
                                    efFieldGroup.FieldGroupsRolesMAPs.Remove(map);
                                    context.FieldGroupsRolesMAPs.Remove(map);
                                }
                            }

                        }
                        //Adding entries from the received list which don't exist yet
                        if (fieldGroup.RoleIDsVisible != null)
                        {
                            foreach (int indx in fieldGroup.RoleIDsVisible)
                                if (efFieldGroup.FieldGroupsRolesMAPs.Any(v => v.RoleID == indx) == false)
                                    efFieldGroup.FieldGroupsRolesMAPs.Add(new FieldGroupsRolesMAP() { OrganizationIdentifier = this.organizationIdentifier, RoleID = indx, FieldGroupID = (int)fieldGroup.ID, AllowView = true, AllowEdit = fieldGroup.RoleIDsEditable.Any(x => x == indx) });
                                else
                                {
                                    efFieldGroup.FieldGroupsRolesMAPs.Single(v => v.RoleID == indx).AllowView = true;
                                    efFieldGroup.FieldGroupsRolesMAPs.Single(v => v.RoleID == indx).AllowEdit = fieldGroup.RoleIDsEditable.Any(x => x == indx);
                                }
                        }
                    }

                    if (fieldGroup.New == false)
                    {
                        // code to change record counters for the contracts fields (i.e from -999999 to 1) when a
                        // single record field group is converted into a multiple record field group.
                        if (context.FieldGroups.SingleOrDefault(fg => fg.FieldGroupID == efFieldGroup.FieldGroupID).SingleRecord == true && fieldGroup.SingleRecord == false)
                        {
                            List<TopContractsEntities.ContractField> contractFldsToRemoveIfAny = new List<TopContractsEntities.ContractField>();
                            foreach (TopContractsEntities.ContractField cFld in efFieldGroup.ContractFields)
                            {
                                if (cFld.RecordCounter > 0)
                                    contractFldsToRemoveIfAny.Add(cFld);
                                else if (cFld.RecordCounter == (long)RecordCounter.Default)
                                    cFld.RecordCounter = 1;
                            }

                            if (contractFldsToRemoveIfAny.Count > 0)
                                foreach (TopContractsEntities.ContractField contractFldToRemove in contractFldsToRemoveIfAny)
                                {
                                    context.ContractFields.Remove(contractFldToRemove);
                                }
                        }
                    }

                    efFieldGroup.SingleRecord = fieldGroup.SingleRecord;

                    // code area to  remove contract fields if field group is being changed from multiple
                    // record to single record.
                    if (Convert.ToBoolean(efFieldGroup.SingleRecord) && efFieldGroup.ContractFields.Count > 0)
                    {
                        List<TopContractsEntities.ContractField> contractFldsToRemove = new List<TopContractsEntities.ContractField>();
                        if (efFieldGroup.ContractFields.Any(cf => cf.RecordCounter > 0))
                        {
                            List<long> mappedContractIds = efFieldGroup.ContractFields.Where(cf => cf.RecordCounter > 0).Select(cf => cf.ContractID).Distinct().ToList();

                            foreach (long mappedContractId in mappedContractIds)
                            {
                                foreach (TopContractsEntities.ContractField contractFld in efFieldGroup.ContractFields.Where(ctFld => ctFld.ContractID == mappedContractId && ctFld.FieldGroupID == efFieldGroup.FieldGroupID))
                                {
                                    if (contractFld.RecordCounter == 1)
                                    {
                                        contractFld.RecordCounter = (long)RecordCounter.Default;
                                        contractFld.FieldValue = null;
                                        contractFld.LinkedUserID = null;
                                        contractFld.FieldValueNumeric = null;
                                        contractFld.FieldValueDate = null;
                                        contractFld.FieldValueTime = null;
                                        contractFld.FieldCurrencyID = null;
                                        contractFld.LinkedEventID = null;
                                        contractFld.LinkedUserID = null;
                                        contractFld.LinkedDocumentID = null;
                                        contractFld.LinkedContractID = null;
                                    }
                                    else
                                        contractFldsToRemove.Add(contractFld);
                                }
                            }
                        }

                        if (contractFldsToRemove.Count > 0)
                            foreach (TopContractsEntities.ContractField contractFldToRemove in contractFldsToRemove)
                            {
                                context.ContractFields.Remove(contractFldToRemove);
                            }
                    }

                    if (fieldGroup.GroupFields == null)
                    {
                        //do nothing here - no fields
                    }
                    else
                    {
                        foreach (TopContractsDAL10.SystemTables.Field field in fieldGroup.GroupFields.Entries)
                        {
                            if (field.New)
                            {
                                efField = new TopContractsEntities.Field();
                            }
                            else
                            {
                                efField = context.Fields.Where(c => c.FieldID == field.ID).SingleOrDefault();
                            }
                            if (field.Deleted == false)
                            {
                                efField.InitCommonFields(efField, field, efField.FieldsLNGs, this.organizationIdentifier);
                                efField.FieldLength = field.FieldLength;
                                efField.UseFirstAsDefault = field.UseFirstAsDefault;
                                efField.FieldType = field.FieldType;

                                efField.Mandatory = field.Mandatory;
                                efField.AllowMultipleSelection = field.AllowMultipleSelection;
                                efField.MandatoryCurrencyID = field.MandatoryCurrencyID;
                                efField.DisplayFormat = field.DisplayFormat;
                                efField.MandatoryEventTypeID = field.MandatoryEventTypeID;
                                efField.Formula = field.Formula;
                                efField.IsCalculatedCurrency = field.IsCalculatedCurrency;
                                efField.FieldIDForCurrency = field.FieldIDForCurrency;
                                efField.AllowUnauthorizedUsers = field.AllowUnauthorizedUsers;
                                efField.LinkedFieldID = field.LinkedFieldID;
                                efField.DefaultValue = field.DefaultValue;
                                efField.IsWholeNumber = field.IsWholeNumber;
                                efField.MinimumNumericValue = field.MinimumNumericValue;
                                efField.MaximumNumericValue = field.MaximumNumericValue;

                                //if (!string.IsNullOrEmpty(field.ExternalID))
                                //    efField.ExternalID = field.ExternalID.Substring(0, field.ExternalID.IndexOf(Constants.entityFieldsDivider));

                                //Modified by Salil on 19-July-2013; 
                                //this condition is true if the catalog field is changed in fieldgroup. Eg:- Catalog A is replcaed by Catalog B in a FieldGroup FG.
                                if (efField.LinkedEntityID != field.LinkedEntityID)
                                {
                                    List<long> ctlFldLst = context.ContractTypesFieldsToCreateDefaults.Where(t => t.ContractTypeID == efField.LinkedEntityID).Select(t => t.FieldID).ToList();
                                    foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(fld => fld.FieldGroupID == fieldGroup.ID && fld.FieldID == field.ID && fld.CatalogFieldID != null && ctlFldLst.Contains((long)fld.CatalogFieldID)).ToList())
                                    {
                                        context.ContractFields.Remove(contractField);
                                    }
                                }

                                efField.LinkedEntityID = field.LinkedEntityID;

                                //if (field.FieldListItems != null && field.FieldType == (int)FieldTypes.ListSingle)
                                if (field.FieldListItems != null)
                                {
                                    if (field.FieldListItems.Entries.Count > 0)
                                    {
                                        //------------------------------------------------
                                        foreach (TopContractsDAL10.SystemTables.FieldListItem fieldListItem in field.FieldListItems.Entries)
                                        {
                                            if (fieldListItem.New)
                                            {
                                                efFieldListItem = new TopContractsEntities.FieldListItem();
                                            }
                                            else
                                            {
                                                efFieldListItem = context.FieldListItems.Where(c => c.FieldListItemID == fieldListItem.ID).SingleOrDefault();
                                            }
                                            if (fieldListItem.Deleted == false)
                                            {
                                                efFieldListItem.InitCommonFields(efFieldListItem, fieldListItem, efFieldListItem.FieldListItemsLNGs, this.organizationIdentifier);
                                                //efFieldListItem.FieldID = (int)fieldListItem.FieldID;
                                                //TODO - any more?...
                                            }

                                            if (fieldListItem.New)
                                                efField.FieldListItems.Add(efFieldListItem);
                                            else
                                            {
                                                if (fieldListItem.Deleted && efFieldListItem != null)
                                                {
                                                    if (CascadeDelete)
                                                    {
                                                        string strFieldListItemID = fieldListItem.ID.ToString();
                                                        var t = context.Contracts.Where(ct => ct.ContractFields.Any(ctfld => ctfld.FieldID == field.ID && ctfld.FieldValue == strFieldListItemID));
                                                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(ct => ct.ContractFields.Any(ctfld => ctfld.FieldID == field.ID && ctfld.FieldValue == strFieldListItemID)))
                                                        {
                                                            if (field.FieldType == (int)FieldTypes.ListSingle)
                                                                foreach (var ctrlfld in contract.ContractFields.Where(ctfld => ctfld.FieldID == field.ID && ctfld.FieldValue == strFieldListItemID))
                                                                    ctrlfld.FieldValue = null;
                                                            else
                                                                contract.ContractFields.Where(ctfld => ctfld.FieldID == field.ID).SingleOrDefault().FieldValue = null;
                                                        }

                                                        if (context.ContractFields.Any(ctfld => ctfld.CatalogFieldID == field.ID && ctfld.FieldValue == strFieldListItemID))
                                                        {
                                                            foreach (TopContractsEntities.Contract contract in context.Contracts.Where(ct => ct.ContractFields.Any(ctfld => ctfld.CatalogFieldID == field.ID && ctfld.FieldValue == strFieldListItemID)))
                                                            {
                                                                if (field.FieldType == (int)FieldTypes.ListSingle)
                                                                    foreach (var ctrlfld in contract.ContractFields.Where(ctfld => ctfld.CatalogFieldID == field.ID && ctfld.FieldValue == strFieldListItemID))
                                                                        ctrlfld.FieldValue = null;
                                                            }
                                                        }
                                                    }


                                                    efFieldListItem.DeleteLanguageEntries(efFieldListItem, context.FieldListItemsLNGs, efFieldListItem.FieldListItemsLNGs);


                                                    efFieldListItem.Field.FieldListItems.Remove(efFieldListItem);
                                                    context.FieldListItems.Remove(efFieldListItem);
                                                }
                                            }
                                        }
                                    }
                                    //------------------------------------------------
                                }
                                //TODO - any more?...
                            }

                            if (field.New)
                                efFieldGroup.Fields.Add(efField);
                            else
                            {
                                if (field.Deleted && efField != null)
                                {
                                    //if (CascadeDelete && efField.FieldGroup.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll)
                                    //{
                                    //    foreach (TopContractsEntities.Contract contract in context.Contracts)
                                    //    {
                                    //        contract.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldID == efField.EntryIdentifier));
                                    //    }
                                    //    foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(cf => cf.FieldID == efField.EntryIdentifier))
                                    //    {
                                    //        context.ContractFields.Remove(contractField);
                                    //    }
                                    //}
                                    //if (CascadeDelete && efField.FieldGroup.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && efField.FieldGroup.FieldGroupsContractTypesMAPs != null)
                                    //{
                                    //    foreach (TopContractsEntities.FieldGroupsContractTypesMAP contractTypeMap in efField.FieldGroup.FieldGroupsContractTypesMAPs)
                                    //    {
                                    //        foreach (TopContractsEntities.Contract contract in contractTypeMap.ContractType.Contracts)
                                    //        {
                                    //            contract.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldID == efField.EntryIdentifier));
                                    //        }
                                    //        foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(cf => cf.FieldID == efField.EntryIdentifier))
                                    //        {
                                    //            context.ContractFields.Remove(contractField);
                                    //        }
                                    //    }
                                    //}
                                    if (CascadeDelete)
                                    {
                                        foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(fld => fld.FieldID == efField.FieldID).ToList())
                                        {
                                            context.ContractFields.Remove(contractField);
                                        }

                                        if (efFieldGroup.FieldGroupsContractTypesMAPs.Count() == 1)
                                        {
                                            long ContractTypeContractID = Utilities.contractTypeContractsID;
                                            if (efFieldGroup.FieldGroupsContractTypesMAPs.First().ContractType.ParentContractTypeID != ContractTypeContractID || efFieldGroup.FieldGroupsContractTypesMAPs.First().ContractType.ParentContractTypeID == null)
                                            {
                                                foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(fld => fld.CatalogFieldID == efField.FieldID).ToList())
                                                {
                                                    context.ContractFields.Remove(contractField);
                                                }
                                            }
                                        }
                                    }

                                    efField.DeleteLanguageEntries(efField, context.FieldsLNGs, efField.FieldsLNGs);
                                    for (int indx = efField.FieldListItems.Count() - 1; indx >= 0; indx--)
                                    {
                                        TopContractsEntities.FieldListItem itm = efField.FieldListItems.ElementAt(indx);
                                        itm.DeleteLanguageEntries(itm, context.FieldListItemsLNGs, itm.FieldListItemsLNGs);
                                        context.FieldListItems.Remove(itm);
                                    }
                                    efField.FieldGroup.Fields.Remove(efField);
                                    context.Fields.Remove(efField);
                                }
                            }
                        }
                    }

                }

                if (fieldGroup.New)
                    context.FieldGroups.Add(efFieldGroup);
                else
                {
                    if (fieldGroup.Deleted && efFieldGroup != null)
                    {
                        efFieldGroup.DeleteLanguageEntries(efFieldGroup, context.FieldGroupsLNGs, efFieldGroup.FieldGroupsLNGs);
                        for (int indx = efFieldGroup.Fields.Count() - 1; indx >= 0; indx--)
                        {
                            TopContractsEntities.Field fld = efFieldGroup.Fields.ElementAt(indx);
                            fld.DeleteLanguageEntries(fld, context.FieldsLNGs, fld.FieldsLNGs);
                            for (int indx2 = fld.FieldListItems.Count() - 1; indx2 >= 0; indx2--)
                            {
                                TopContractsEntities.FieldListItem itm = fld.FieldListItems.ElementAt(indx2);
                                itm.DeleteLanguageEntries(itm, context.FieldListItemsLNGs, itm.FieldListItemsLNGs);
                                context.FieldListItems.Remove(itm);
                            }

                            //if (CascadeDelete && fld.FieldGroup.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll)
                            //{
                            //    foreach (TopContractsEntities.Contract contract in context.Contracts)
                            //    {
                            //        contract.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldID == fld.EntryIdentifier));
                            //    }
                            //    foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(cf => cf.FieldID == fld.EntryIdentifier))
                            //    {
                            //        context.ContractFields.Remove(contractField);
                            //    }
                            //}
                            //if (CascadeDelete && fld.FieldGroup.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && fld.FieldGroup.FieldGroupsContractTypesMAPs != null)
                            //{
                            //    foreach (TopContractsEntities.FieldGroupsContractTypesMAP contractTypeMap in fld.FieldGroup.FieldGroupsContractTypesMAPs)
                            //    {
                            //        foreach (TopContractsEntities.Contract contract in contractTypeMap.ContractType.Contracts)
                            //        {
                            //            contract.ContractFields.Remove(contract.ContractFields.Single(cf => cf.FieldID == fld.EntryIdentifier));
                            //        }
                            //        foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(cf => cf.FieldID == fld.EntryIdentifier))
                            //        {
                            //            context.ContractFields.Remove(contractField);
                            //        }
                            //    }
                            //}

                            // Mohit - Added code to remove all the contract field of a Field group being removed.
                            if (CascadeDelete)
                                foreach (TopContractsEntities.ContractField contractField in context.ContractFields.Where(fg => fg.FieldGroupID == efFieldGroup.FieldGroupID).ToList())
                                {
                                    context.ContractFields.Remove(contractField);
                                }


                            context.Fields.Remove(fld);
                        }
                        for (int indx = efFieldGroup.FieldGroupsContractTypesMAPs.Count() - 1; indx >= 0; indx--)
                        {
                            TopContractsEntities.FieldGroupsContractTypesMAP map = efFieldGroup.FieldGroupsContractTypesMAPs.ElementAt(indx);
                            context.FieldGroupsContractTypesMAPs.Remove(map);
                        }
                        for (int indx = efFieldGroup.FieldGroupsRolesMAPs.Count() - 1; indx >= 0; indx--)
                        {
                            TopContractsEntities.FieldGroupsRolesMAP map = efFieldGroup.FieldGroupsRolesMAPs.ElementAt(indx);
                            context.FieldGroupsRolesMAPs.Remove(map);
                        }
                        context.FieldGroups.Remove(efFieldGroup);
                    }
                }
            }

            if (!populateMapDictionary)
            {
                context.SaveChanges();
            }
            else
            {
                ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
                objectContext.DetectChanges();

                objectContext.SaveChanges(SaveOptions.None); //This will fill the IDs with new values, needed for the next part...

                bool structuralChangeOccurred = false; // flag raised when a structural change is occurred.
                //bool informationalChange = false; // flag raised when a change other than structure is occurred.
                long nonStructuralChanges = 0;

                foreach (var changedEntry in context.ChangeTracker.Entries())
                {
                    if (changedEntry.State == System.Data.EntityState.Added && changedEntry.Entity is TopContractsEntities.Field)
                    {
                        if (changedEntry.CurrentValues["ExternalID"] != null)
                        {
                            string externalId = changedEntry.CurrentValues["ExternalID"].ToString();
                            if (externalId.IndexOf(Constants.entityFieldsDivider) >= 0)
                            {
                                string id = externalId.Substring(externalId.IndexOf(Constants.entityFieldsDivider));
                                id = id.Replace(Constants.entityFieldsDivider, "");
                                int originalFieldID = Convert.ToInt32(id);
                                EntityFieldIDsMap.Add(originalFieldID, Convert.ToInt64(changedEntry.CurrentValues["FieldID"]));
                            }
                        }

                        if (isCatalogField == false)
                            structuralChangeOccurred = true;
                        else
                            nonStructuralChanges += 1;
                    }
                    else if (changedEntry.Entity is TopContractsEntities.Field && changedEntry.State == System.Data.EntityState.Deleted)
                    {
                        if (isCatalogField == false)
                            structuralChangeOccurred = true;
                        else
                            nonStructuralChanges += 1;
                    }
                    else if (changedEntry.Entity is TopContractsEntities.Field && changedEntry.State == System.Data.EntityState.Modified)
                    {
                        if (isCatalogField == false)
                            nonStructuralChanges += 1;
                        else
                            nonStructuralChanges += 1;
                    }
                    else if (changedEntry.Entity is TopContractsEntities.FieldsLNG && changedEntry.State == System.Data.EntityState.Modified)
                        nonStructuralChanges += 1;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroup && changedEntry.State == System.Data.EntityState.Added)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroup && changedEntry.State == System.Data.EntityState.Deleted)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroup && changedEntry.State == System.Data.EntityState.Modified)
                        nonStructuralChanges += 1;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsLNG && changedEntry.State == System.Data.EntityState.Modified)
                        nonStructuralChanges += 1;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsContractTypesMAP && changedEntry.State == System.Data.EntityState.Added)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsContractTypesMAP && changedEntry.State == System.Data.EntityState.Deleted)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsRolesMAP && changedEntry.State == System.Data.EntityState.Added)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsRolesMAP && changedEntry.State == System.Data.EntityState.Deleted)
                        structuralChangeOccurred = true;
                    else if (changedEntry.Entity is TopContractsEntities.FieldGroupsRolesMAP && changedEntry.State == System.Data.EntityState.Modified)
                        structuralChangeOccurred = true;
                }

                objectContext.AcceptAllChanges();

                //if (isCatalogField && structuralChangeOccurred == false)
                //{
                //    foreach (long fieldId in addedFieldIDs)
                //    {
                //        if(structuralChangeOccurred==false)
                //    }
                //}

                TopContractsDAL10.CachedData.ClearCachedData(); // To clear cached data of Fields Lng.
                ApplicationCachedData.reInitCacheData(); // To re-initialize server side cache.

                if (structuralChangeOccurred)
                    ApplicationCachedData.UpdateContractStructureCacheTicks();
                else
                    if (nonStructuralChanges > 0)
                        if (isCatalogField)
                            ApplicationCachedData.UpdateCatalogCacheTicks();
                        else
                            ApplicationCachedData.UpdateContractDisplayCacheTicks();
            }

            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept

            foreach (TopContractsEntities.FieldGroup efFldGrp in context.FieldGroups.Where(fgrp => fgrp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll || fgrp.FieldGroupsContractTypesMAPs.Any(cTypeMap => cTypeMap.ContractType.ParentContractTypeID == ContractTypeContractsID) == true))
            {
                List<long> contractIDs = new List<long>();
                List<long?> recordcounters = new List<long?>();

                if (efFldGrp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll)
                {
                    foreach (TopContractsEntities.Field efFld in efFldGrp.Fields)
                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID && c.ContractFields.Any(cf => cf.FieldID == efFld.FieldID) == false))
                        {
                            if (efFld.FieldType == (int)FieldTypes.EntityLink)
                            {
                                foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault contDef in context.ContractTypesFieldsToCreateDefaults.Where(c => c.ContractTypeID == efFld.LinkedEntityID))
                                {
                                    /* change this check */
                                    if (contract.ContractFields.Any(cf => cf.FieldID == efFld.FieldID && cf.FieldGroupID == efFldGrp.FieldGroupID && cf.CatalogFieldID == contDef.FieldID) == false)
                                    {
                                        recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == efFldGrp.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                        TopContractsEntities.Field efDefFld = context.Fields.Where(defld => defld.FieldID == contDef.FieldID).SingleOrDefault();
                                        if (recordcounters.Count != 0)
                                        {
                                            foreach (long? recordcounter in recordcounters)
                                            {
                                                //**************Code Commented by Viplav on 3 mat 2013 for resolving the issue of save undefined text in contract fields**********

                                                //if ((efFld.FieldType == (int)FieldTypes.Autonumber && recordcounter > 0) || efFld.FieldGroup.SingleRecord == true)
                                                //{
                                                //    CreateCounterforNewField(context, checkMax, efFld, contract, recordcounter);
                                                //}
                                                //else
                                                //{

                                                //*****************************************************************************************
                                                contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                                {
                                                    FieldGroupID = efFld.FieldGroupID,
                                                    FieldID = efFld.FieldID,
                                                    CatalogFieldID = efDefFld.FieldID,
                                                    FieldValue = (efDefFld.FieldType == (int)FieldTypes.ListSingle && efDefFld.FieldListItems.Count > 0 && efDefFld.UseFirstAsDefault == true ? efDefFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                    RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                                });
                                                //}
                                            }
                                        }
                                        else
                                        {
                                            contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                            {
                                                FieldGroupID = efFld.FieldGroupID,
                                                FieldID = efFld.FieldID,
                                                CatalogFieldID = efDefFld.FieldID,
                                                FieldValue = (efDefFld.FieldType == (int)FieldTypes.ListSingle && efDefFld.FieldListItems.Count > 0 && efDefFld.UseFirstAsDefault == true ? efDefFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                            });
                                        }
                                    }
                                }
                            }
                            else
                            {
                                recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == efFldGrp.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                if (recordcounters.Count != 0)
                                {
                                    foreach (long? recordcounter in recordcounters)
                                    {
                                        if ((efFld.FieldType == (int)FieldTypes.Autonumber && recordcounter > 0) || (efFld.FieldGroup.SingleRecord == true && efFld.FieldType == (int)FieldTypes.Autonumber))
                                        {
                                            CreateCounterforNewField(context, checkMax, efFld, contract, recordcounter);
                                        }
                                        else
                                        {
                                            contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                            {
                                                FieldGroupID = efFld.FieldGroupID,
                                                FieldID = efFld.FieldID,
                                                FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                            });
                                        }
                                    }
                                }
                                else
                                {
                                    contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                    {
                                        FieldGroupID = efFld.FieldGroupID,
                                        FieldID = efFld.FieldID,
                                        FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                        RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                    });
                                }
                            }
                        }
                }
                else
                {
                    if (efFldGrp.FieldGroupsContractTypesMAPs != null)
                        foreach (FieldGroupsContractTypesMAP fgcMap in efFldGrp.FieldGroupsContractTypesMAPs)
                        {
                            if (context.Contracts.Any(c => c.ContractTypeID == fgcMap.ContractTypeID))
                                contractIDs.AddRange(context.Contracts.Where(c => c.ContractTypeID == fgcMap.ContractTypeID && c.ContractType.ParentContractTypeID == ContractTypeContractsID).Select(c => c.ContractID));
                        }
                    if (contractIDs.Count > 0)
                        foreach (TopContractsEntities.Field efFld in efFldGrp.Fields)
                        {
                            foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => (c.ContractFields.Any(cf => cf.FieldID == efFld.FieldID) == false) && c.ContractType.ParentContractTypeID == ContractTypeContractsID))
                            {
                                if (contractIDs.Contains(contract.ContractID))
                                {
                                    if (efFld.FieldType == (int)FieldTypes.EntityLink)
                                    {
                                        foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault contDef in context.ContractTypesFieldsToCreateDefaults.Where(c => c.ContractTypeID == efFld.LinkedEntityID))
                                        {
                                            /* change this check */
                                            if (contract.ContractFields.Any(cf => cf.FieldID == efFld.FieldID && cf.FieldGroupID == efFldGrp.FieldGroupID && cf.CatalogFieldID == contDef.FieldID) == false)
                                            {
                                                recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == efFldGrp.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                                if (recordcounters.Count != 0)
                                                {
                                                    foreach (long? recordcounter in recordcounters)
                                                    {
                                                        //**************Code Commented by Viplav on 3 mat 2013 for resolving the issue of save undefined text in contract fields**********

                                                        //if ((efFld.FieldType == (int)FieldTypes.Autonumber && recordcounter > 0) || efFld.FieldGroup.SingleRecord == true)
                                                        //{
                                                        //    CreateCounterforNewField(context, checkMax, efFld, contract, recordcounter);
                                                        //}
                                                        //else
                                                        //{
                                                        //********************************************************************************
                                                        contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                                        {
                                                            FieldGroupID = efFld.FieldGroupID,
                                                            FieldID = efFld.FieldID,
                                                            CatalogFieldID = contDef.Field.FieldID,
                                                            FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.FieldListItems.Count > 0 && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                            RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                                        });
                                                        //}
                                                    }
                                                }
                                                else
                                                {
                                                    contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                                    {
                                                        FieldGroupID = efFld.FieldGroupID,
                                                        FieldID = efFld.FieldID,
                                                        CatalogFieldID = contDef.Field.FieldID,
                                                        FieldValue = (contDef.Field.FieldType == (int)FieldTypes.ListSingle && contDef.Field.FieldListItems.Count > 0 && contDef.Field.UseFirstAsDefault == true ? contDef.Field.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                        RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {

                                        recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == efFldGrp.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                        if (recordcounters.Count != 0)
                                        {
                                            foreach (long? recordcounter in recordcounters)
                                            {
                                                if ((efFld.FieldType == (int)FieldTypes.Autonumber && recordcounter > 0) || (efFld.FieldGroup.SingleRecord == true && efFld.FieldType == (int)FieldTypes.Autonumber))
                                                {
                                                    CreateCounterforNewField(context, checkMax, efFld, contract, recordcounter);
                                                }
                                                else
                                                {
                                                    contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                                    {
                                                        FieldGroupID = efFld.FieldGroupID,
                                                        FieldID = efFld.FieldID,
                                                        FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                        RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                                    });
                                                }
                                            }
                                        }
                                        else
                                        {
                                            contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                            {
                                                FieldGroupID = efFld.FieldGroupID,
                                                FieldID = efFld.FieldID,
                                                FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                            });
                                        }
                                    }
                                }
                            }
                        }


                    contractIDs = new List<long>();
                    bool noMap = false;
                    if (efFldGrp.FieldGroupsContractTypesMAPs == null)
                        noMap = true;
                    else
                        if (efFldGrp.FieldGroupsContractTypesMAPs.Count == 0)
                            noMap = true;
                    if (noMap)
                        contractIDs.AddRange(context.Contracts.Select(c => c.ContractID));
                    else
                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID))
                        {
                            if (efFldGrp.FieldGroupsContractTypesMAPs.Any(fgcMap => fgcMap.ContractTypeID == contract.ContractTypeID) == false)
                                contractIDs.Add(contract.ContractID);
                        }
                    DateTime updateDate = DateTime.Now;
                    if (contractIDs.Count > 0)
                        foreach (int cId in contractIDs)
                        {
                            TopContractsEntities.Contract contract = context.Contracts.Single(c => c.ContractID == cId);
                            if (contract.ContractFields.Any(cf => cf.FieldGroupID == efFldGrp.FieldGroupID))
                            {
                                List<TopContractsEntities.ContractField> cFields = contract.ContractFields.Where(cf => cf.FieldGroupID == efFldGrp.FieldGroupID).ToList();
                                for (int indx = cFields.Count - 1; indx >= 0; indx--)
                                {
                                    TopContractsEntities.ContractField efCtrctFld = cFields[indx];
                                    context.ContractFields.Remove(efCtrctFld);
                                    if (AuditChanges)
                                    {
                                        HistManager histManager = new HistManager();
                                        histManager.AuditFieldRemoval(updateDate, UpdatingUserID, efCtrctFld);
                                    }
                                }
                            }
                        }
                }
            }


            return context.SaveChanges();
            //return -1;
        }

        public void CreateCounterforNewField(TopContractsV01Entities context, Dictionary<long, long> checkMax, TopContractsEntities.Field efFld, TopContractsEntities.Contract contract, long? recordcounter)
        {
            ContractFieldGroup cfld = new ContractFieldGroup();
            long maxfldValue = 0;
            if (checkMax.ContainsKey(efFld.FieldID))
            {
                checkMax.TryGetValue(efFld.FieldID, out maxfldValue);
                checkMax[efFld.FieldID] = maxfldValue + 1;
            }
            else
            {
                maxfldValue = Convert.ToInt64(context.ContractFields.Where(fld => fld.FieldID == efFld.FieldID).Max(fld => fld.FieldValueNumeric));
                checkMax.Add(efFld.FieldID, maxfldValue + 1);

            }
            string disFormat = cfld.GetAutoNumberDisplayFormat(efFld.DisplayFormat, maxfldValue);
            string getString = disFormat.Substring(disFormat.IndexOf("num=") + 4);
            long noofPadding = Convert.ToInt64(getString.Substring(0, getString.IndexOf("suf=")));
            disFormat = disFormat.Replace("num=", "");
            disFormat = disFormat.Replace("suf=", "");
            contract.ContractFields.Add(new TopContractsEntities.ContractField()
            {
                FieldGroupID = efFld.FieldGroupID,
                FieldID = efFld.FieldID,
                FieldValue = disFormat,
                FieldValueNumeric = noofPadding,
                RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
            });
        }

        public int Save(TopContractsDAL10.SystemTables.Organization Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            TopContractsEntities.Organization efOrg = null;
            foreach (TopContractsDAL10.SystemTables.Unit unit in Data.Entries)
            {
                if (unit.New)
                    efOrg = new TopContractsEntities.Organization();
                else
                    efOrg = context.Organizations.Where(c => c.UnitID == unit.ID).SingleOrDefault();

                if (unit.Deleted == false)
                {
                    efOrg.InitCommonFields(efOrg, unit, efOrg.OrganizationLNGs, this.organizationIdentifier);
                    efOrg.UnitLevel = unit.UnitLevel;
                    efOrg.ParentUnitID = unit.ParentUnitID;
                }

                if (unit.New)
                    context.Organizations.Add(efOrg);
                else
                {
                    if (unit.Deleted && efOrg != null)
                    {
                        efOrg.DeleteLanguageEntries(efOrg, context.OrganizationLNGs, efOrg.OrganizationLNGs);
                        context.Organizations.Remove(efOrg);

                        //List<TopContractsEntities.Organization> childUnits = context.Organizations.Where(p => p.ParentUnitID == unit.ID).ToList();
                        //foreach (TopContractsEntities.Organization child in childUnits)
                        //{
                        //    context.Organizations.Remove(child);
                        //    child.DeleteLanguageEntries(child, context.OrganizationLNGs, child.OrganizationLNGs); 
                        //}
                    }
                }

            }
            return context.SaveChanges();
        }

        public int Save(ReportsInfoes Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.ReprotsInfo efReportInfo = null;
            foreach (TopContractsDAL10.SystemTables.ReportsInfo reportInfo in Data.Entries)
            {
                if (reportInfo.New)
                {
                    efReportInfo = new TopContractsEntities.ReprotsInfo();
                    efReportInfo.ReportID = new Guid();
                }
                else
                {
                    efReportInfo = context.ReprotsInfoes.Where(c => c.ReportID == new Guid(reportInfo.ReportID)).SingleOrDefault();
                }

                if (reportInfo.Deleted == false)
                {
                    efReportInfo.Data = reportInfo.Data;
                    efReportInfo.ExternalReport = reportInfo.ExternalReport;
                    efReportInfo.Locked = reportInfo.Locked;
                    efReportInfo.Name = reportInfo.Name;
                    efReportInfo.ReportID = new Guid(reportInfo.ReportID);
                    efReportInfo.Shared = reportInfo.Shared;
                    efReportInfo.Type = reportInfo.Type;
                    efReportInfo.UserId = reportInfo.UserId;
                    efReportInfo.OrganizationIdentifier = this.organizationIdentifier;
                }

                if (reportInfo.New)
                    context.ReprotsInfoes.Add(efReportInfo);
                else
                {
                    if (reportInfo.Deleted && efReportInfo != null)
                    {
                        context.ReprotsInfoes.Remove(efReportInfo);
                    }
                }
            }
            return context.SaveChanges();
        }

        /// <summary>
        /// Checks if a field group is associated with a contract.
        /// </summary>
        /// <param action="FieldGroupID">Id of the field group whose association is required to be checked.</param>
        /// <returns></returns>
        public static bool CheckFieldGroupMappingWithContract(long FieldGroupID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            return context.ContractFields.Any(fg => fg.FieldGroupID == FieldGroupID && fg.FieldValue != null);
        }

        /// <summary>
        /// Checks if a field is associated with a contract.
        /// </summary>
        /// <param action="FieldID">Id of the field whose association is required to be checked.</param>
        /// <returns></returns>
        public static bool CheckFieldMappingWithContract(long FieldID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            return context.ContractFields.Any(fld => fld.FieldID == FieldID && fld.FieldValue != null);
        }

        /// <summary>
        /// Checks if a contract type is  associated with a field group. Checks for a non null record in FieldGroupsContractTypesMAP table with the FieldGroupID and ContractTypeID.
        /// </summary>
        /// <param action="FieldGroupID">Id of the field group whose association is required to be checked.</param>
        /// <param action="ContractTypeID">Id of the contract type whose association is required to be checked.</param>
        /// <returns></returns>
        public static bool CheckFieldGroupContractTypeMapping(long FieldGroupID, long ContractTypeID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            return context.ContractFields.Any(fld => fld.FieldGroupID == FieldGroupID && fld.Contract.ContractTypeID == ContractTypeID && fld.FieldValue != null);
        }

        #region Entities CRUD operations

        public int SaveEntities(ContractTypes Data)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.ContractType efContractType = null;
            foreach (TopContractsDAL10.SystemTables.ContractType contractType in Data.Entries)
            {
                if (contractType.New)
                {
                    efContractType = new TopContractsEntities.ContractType();
                }
                else
                {
                    efContractType = context.ContractTypes.Where(c => c.ContractTypeID == contractType.ID).SingleOrDefault();
                    if (contractType.Deleted == false)
                    {
                        SaveDefaultEntityFields(contractType.DefaultEntityFields.ToList(), contractType.ID);
                        SaveEntityGroup(efContractType, contractType.EntryTexts, false);
                    }
                }

                if (contractType.Deleted == false)
                {
                    efContractType.InitCommonFields(efContractType, contractType, efContractType.ContractTypesLNGs, this.organizationIdentifier);
                    //                    efContractType.SelectorFieldID = (contractType.SelectorField == (long)DefaultValues.SingleRecordID ? null : contractType.SelectorField); // To be used in case of entities
                    //Boaz 26-02-2013
                    efContractType.SelectorFieldID = (contractType.SelectorField == (long)DefaultValues.SingleRecordID || contractType.SelectorField == 0 ? null : contractType.SelectorField); // To be used in case of entities
                }

                if (contractType.New)
                {
                    context.ContractTypes.Add(efContractType);
                    context.SaveChanges(); // Saved the new contract type so that contract type id must be created and used.
                    SaveEntityGroup(efContractType, contractType.EntryTexts, true); // to create a new field group and to map it with current contract type.
                }
                else
                {
                    if (contractType.Deleted && efContractType != null)
                    {
                        // Need to be discussed with Boaz, whether the catalog type fields will be removed or LinkedEntityField will be removed.
                        foreach (TopContractsEntities.Field efFld in context.Fields.Where(fld => fld.LinkedEntityID == contractType.ID).ToList())
                        {
                            efFld.DeleteLanguageEntries(efFld, context.FieldsLNGs, efFld.FieldsLNGs);
                            context.Fields.Remove(efFld);
                        }

                        //Deleted entity records,entity fields,entity,FieldGroupsContractTypesMAPs,and Contract type --Added by deepak dhamija (28/02/2013)
                        efContractType.DeleteLanguageEntries(efContractType, context.ContractTypesLNGs, efContractType.ContractTypesLNGs);
                        FieldGroupsContractTypesMAP cTypeMap = context.FieldGroupsContractTypesMAPs.SingleOrDefault(map => map.ContractTypeID == efContractType.ContractTypeID);
                        if (cTypeMap != null)
                        {
                            //******************Condition Implemented for delete entry from FieldGroupsRolesMAP by Viplav on 15-Oct-2013********//
                            if (context.FieldGroupsRolesMAPs.Any(ent => ent.FieldGroupID == cTypeMap.FieldGroupID))
                            {
                                List<FieldGroupsRolesMAP> FieldGroupsRoleMap = context.FieldGroupsRolesMAPs.Where(t => t.FieldGroupID == cTypeMap.FieldGroupID).ToList();
                                foreach (FieldGroupsRolesMAP item in FieldGroupsRoleMap)
                                    context.FieldGroupsRolesMAPs.Remove(item);
                            }
                            //********************************************************************************************************************
                            TopContractsEntities.FieldGroup entityGroup = context.FieldGroups.SingleOrDefault(eg => eg.FieldGroupID == cTypeMap.FieldGroupID);
                            if (entityGroup != null)
                            {
                                List<TopContractsEntities.Field> entityfield = context.Fields.Where(ef => ef.FieldGroupID == cTypeMap.FieldGroupID).ToList();
                                if (entityfield != null)
                                {
                                    foreach (var flds in entityfield)
                                    {
                                        flds.DeleteLanguageEntries(flds, context.FieldsLNGs, flds.FieldsLNGs);
                                        if (flds.FieldType == (byte)FieldTypes.ListSingle)
                                        {
                                            foreach (TopContractsEntities.FieldListItem fldListItem in context.FieldListItems.Where(lstItem => lstItem.FieldID == flds.FieldID))
                                            {
                                                fldListItem.DeleteLanguageEntries(fldListItem, context.FieldListItemsLNGs, fldListItem.FieldListItemsLNGs);
                                                context.FieldListItems.Remove(fldListItem);
                                            }
                                        }

                                        foreach (TopContractsEntities.ContractField ctFld in context.ContractFields.Where(f => f.CatalogFieldID == flds.FieldID).ToList())
                                        {
                                            context.ContractFields.Remove(ctFld);
                                        }
                                        context.Fields.Remove(flds);
                                    }
                                }
                                entityGroup.DeleteLanguageEntries(entityGroup, context.FieldGroupsLNGs, entityGroup.FieldGroupsLNGs);
                                context.FieldGroups.Remove(entityGroup);
                            }
                            context.FieldGroupsContractTypesMAPs.Remove(cTypeMap);
                        }
                        context.ContractTypes.Remove(efContractType);
                        //end code--deepak dhamija
                        //Commented by deepak dhamija because its not deleted the entity records and its not verify the LinkedEntityID Exist or not.  
                        //efContractType.DeleteLanguageEntries(efContractType, context.ContractTypesLNGs, efContractType.ContractTypesLNGs);
                        //FieldGroupsContractTypesMAP cTypeMap = context.FieldGroupsContractTypesMAPs.SingleOrDefault(map => map.ContractTypeID == efContractType.ContractTypeID);
                        //if (cTypeMap != null)
                        //{
                        //    TopContractsEntities.FieldGroup entityGroup = context.FieldGroups.SingleOrDefault(eg => eg.FieldGroupID == cTypeMap.FieldGroupID);
                        //    if (entityGroup != null)
                        //    {
                        //        entityGroup.DeleteLanguageEntries(entityGroup, context.FieldGroupsLNGs, entityGroup.FieldGroupsLNGs);
                        //        context.FieldGroups.Remove(entityGroup);
                        //    }
                        //    context.FieldGroupsContractTypesMAPs.Remove(cTypeMap);
                        //}
                        //context.ContractTypes.Remove(efContractType);


                        if (context.ContractTypesFieldsToCreateDefaults.Any(ct => ct.ContractTypeID == contractType.ID))
                        {
                            foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault defEntFld in context.ContractTypesFieldsToCreateDefaults.Where(ct => ct.ContractTypeID == contractType.ID).ToList())
                            {
                                context.ContractTypesFieldsToCreateDefaults.Remove(defEntFld);
                            }
                        }
                    }
                }
            }
            return context.SaveChanges();
        }

        #endregion

        /// <summary>
        /// Updating catalogs (only their names, not their fields or records)
        /// </summary>
        /// <param name="entity">The contract-type defining the catalog</param>
        /// <param name="newEntryTexts">Name/Description of the catalog</param>
        /// <param name="CreateNew">true to signal the creation of a new catalog, false for updating existing catalogs</param>
        public void SaveEntityGroup(TopContractsEntities.ContractType entity, Dictionary<string, SysTableEntryText> newEntryTexts, bool CreateNew)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.FieldGroup efFieldGroup = new TopContractsEntities.FieldGroup();

            //efFieldGroup.InitCommonFields(efFieldGroup, entity, efFieldGroup.FieldGroupsLNGs);
            if (CreateNew)
            {
                foreach (var cTypeLng in entity.ContractTypesLNGs)
                {
                    efFieldGroup.FieldGroupsLNGs.Add(new FieldGroupsLNG { OrganizationIdentifier = this.organizationIdentifier, CultureId = cTypeLng.CultureId, DescShort = cTypeLng.DescShort, DescLong = cTypeLng.DescLong });
                }
                efFieldGroup.OrganizationIdentifier = this.organizationIdentifier;
                efFieldGroup.ContractTypeVisibility = (byte)FieldGroupContractTypeVisibility.VisibleToTypes;
                efFieldGroup.RolesVisibility = (byte)FieldGroupRoleVisibility.VisibleToAll;
                efFieldGroup.Inactive = false;
                efFieldGroup.Locked = false;
                efFieldGroup.DisplayOrder = null;
                efFieldGroup.ExternalID = null;
                efFieldGroup.SingleRecord = true;
                efFieldGroup.FieldGroupsContractTypesMAPs.Add(new FieldGroupsContractTypesMAP { OrganizationIdentifier = this.organizationIdentifier, ContractTypeID = entity.ContractTypeID });
                context.FieldGroups.Add(efFieldGroup);
            }
            else
            {
                // code to modify action of the entity field group when action of an entity is changed.
                if (context.FieldGroupsContractTypesMAPs.Any(u => u.ContractTypeID == entity.ContractTypeID))
                {
                    List<FieldGroupsLNG> fgLngs = context.FieldGroupsContractTypesMAPs.SingleOrDefault(u => u.ContractTypeID == entity.ContractTypeID).FieldGroup.FieldGroupsLNGs.ToList();
                    foreach (var fgLng in fgLngs)
                    {
                        fgLng.DescShort = newEntryTexts.SingleOrDefault(l => l.Key == fgLng.CultureId.Trim()).Value.DescShort;
                        fgLng.DescLong = newEntryTexts.SingleOrDefault(l => l.Key == fgLng.CultureId.Trim()).Value.DescLong;
                    }
                }
            }
            context.SaveChanges();
        }

        public void SaveDefaultEntityFields(List<TopContractsDAL10.ContractTypesFieldsToCreateDefault> defaultfields, long? contractTypeID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.ContractTypesFieldsToCreateDefault efDefaultField = null;


            //foreach (TopContractsEntities.ContractTypesFieldsToCreateDefault defEnt in context.ContractTypesFieldsToCreateDefaults.Where(dent => dent.ContractTypeID == contractTypeID))
            //    context.ContractTypesFieldsToCreateDefaults.Remove(defEnt);

            foreach (TopContractsDAL10.ContractTypesFieldsToCreateDefault defaultEnt in defaultfields)
            {
                if (defaultEnt.New == true)
                {
                    TopContractsEntities.ContractTypesFieldsToCreateDefault efDefaultFieldNew = new TopContractsEntities.ContractTypesFieldsToCreateDefault();
                    efDefaultFieldNew.OrganizationIdentifier = this.organizationIdentifier;
                    efDefaultFieldNew.ContractTypeID = defaultEnt.ContractTypeID;
                    efDefaultFieldNew.FieldID = defaultEnt.FieldID;
                    efDefaultFieldNew.Editable = defaultEnt.Editable;
                    efDefaultFieldNew.ColumnNumber = defaultEnt.ColumnNumber;
                    context.ContractTypesFieldsToCreateDefaults.Add(efDefaultFieldNew);
                }
                else
                {
                    if (context.ContractTypesFieldsToCreateDefaults.Any(fld => fld.FieldID == defaultEnt.FieldID && fld.ContractTypeID == defaultEnt.ContractTypeID))
                    {
                        efDefaultField = context.ContractTypesFieldsToCreateDefaults.Single(fld => fld.FieldID == defaultEnt.FieldID && fld.ContractTypeID == defaultEnt.ContractTypeID);

                        if (defaultEnt.Deleted == false)
                        {
                            efDefaultField.OrganizationIdentifier = this.organizationIdentifier;
                            efDefaultField.Editable = defaultEnt.Editable;
                            efDefaultField.ColumnNumber = defaultEnt.ColumnNumber;
                        }
                        else
                        {
                            context.ContractTypesFieldsToCreateDefaults.Remove(efDefaultField);
                        }
                    }
                }
                //efDefaultField = new TopContractsEntities.ContractTypesFieldsToCreateDefault();

            }

            //context.SaveChanges();
            ObjectContext objectContext = ((IObjectContextAdapter)context).ObjectContext;
            objectContext.DetectChanges();

            objectContext.SaveChanges(SaveOptions.None); //This will fill the IDs with new values, needed for the next part...

            bool structuralChangeOccurred = false; // flag raised when a structural change is occurred.
            //bool informationalChange = false; // flag raised when a change other than structure is occurred.
            long nonStructuralChanges = 0;

            foreach (var changedEntry in context.ChangeTracker.Entries())
            {
                if (changedEntry.Entity is TopContractsEntities.ContractTypesFieldsToCreateDefault && changedEntry.State == System.Data.EntityState.Added)
                    structuralChangeOccurred = true;
                else if (changedEntry.Entity is TopContractsEntities.ContractTypesFieldsToCreateDefault && changedEntry.State == System.Data.EntityState.Deleted)
                    structuralChangeOccurred = true;
                else if (changedEntry.Entity is TopContractsEntities.ContractTypesFieldsToCreateDefault && changedEntry.State == System.Data.EntityState.Modified)
                    nonStructuralChanges += 1;
            }

            objectContext.AcceptAllChanges();

            if (structuralChangeOccurred || defaultfields.Any(fld => fld.New == true) || defaultfields.Any(fld => fld.Deleted == true))
                ApplicationCachedData.UpdateAllCacheTicks();
            else
                if (nonStructuralChanges > 0)
                    ApplicationCachedData.UpdateCatalogCacheTicks();
        }

        /// <summary>
        /// Used to get Entity record values of a selector field to display them in the drop down inside the
        /// Contract field dialog in contract section
        /// </summary>
        /// <param action="FieldId">ID of the selector field whose values have to fetched from ContractFields
        /// table</param>
        /// <returns>List of values of a selector field</returns>
        public static List<EntityRecordValues> GetSelectorFieldValues(long FieldId, string cultureId)
        {
            Logger.WriteGeneralVerbose("DataHandlerPartial_SysTables - GetSelectorFieldValues", "process to get entity record values for a selector field with id {0} started", FieldId);
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            List<EntityRecordValues> selectorFldVals = new List<EntityRecordValues>();
            if (context.Fields.Any(fld => fld.FieldID == FieldId))
            {
                foreach (TopContractsEntities.ContractField ctField in context.ContractFields.Where(ctFld => ctFld.FieldGroupID == context.Fields.FirstOrDefault(fld => fld.FieldID == FieldId).FieldGroupID && ctFld.FieldID == FieldId).OrderBy(cfd => cfd.FieldValue).ToList())
                {
                    selectorFldVals.Add(new EntityRecordValues { ContractID = ctField.ContractID, FieldGroupID = ctField.FieldGroupID, FieldID = ctField.FieldID, FieldValue = (ctField.Field.FieldType == (byte)FieldTypes.Date ? GetContractFieldValueAsDate(ctField.FieldValue, cultureId) : ctField.FieldValue) });
                }
                //selectorFldVals = context.ContractFields.Where(ctFld => ctFld.FieldGroupID == context.Fields.FirstOrDefault(fld => fld.FieldID == FieldId).FieldGroupID && ctFld.FieldID == FieldId).Select(cFld => new EntityRecordValues { ContractID = cFld.ContractID, FieldGroupID = cFld.FieldGroupID, FieldID = cFld.FieldID, FieldValue = (cFld.Field.FieldType == (byte)FieldTypes.Date ? GetContractFieldValueAsDate(cFld.FieldValue, cultureId) : cFld.FieldValue) }).OrderBy(cfd => cfd.FieldValue).ToList(); //Order by condition implemented by viplav on 16-May-2013 for getting selector field record alphabatically
            }

            Logger.WriteGeneralVerbose("DataHandlerPartial_SysTables - GetSelectorFieldValues", "returning the entity record values of a selector field with id {0}", FieldId);
            return selectorFldVals;
        }

        public static string GetContractFieldValueAsDate(string fieldValue, string cultureId)
        {
            string dateStr = string.Empty;
            if ((!string.IsNullOrEmpty(fieldValue)))
            {
                DateTime dateVal = new DateTime(Convert.ToInt32(fieldValue.Substring(0, 4)), Convert.ToInt32(fieldValue.Substring(4, 2)), Convert.ToInt32(fieldValue.Substring(6, 2)));
                dateStr = dateVal.ToString("d", System.Globalization.CultureInfo.CreateSpecificCulture(cultureId));
            }
            return dateStr;
        }

        public static List<EntityRecordValues> GetSelectorEntityFieldValues(long ContractID, long FieldGroupID)
        {
            //Logger.WriteGeneralVerbose("DataHandlerPartial_SysTables - GetSelectorFieldValues", "process to get entity record values for a selector field with id {0} started", FieldId);
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            List<EntityRecordValues> selectorFldVals = new List<EntityRecordValues>();
            //if (context.Fields.Any(fld => fld.FieldID == FieldId))
            //{
            selectorFldVals = context.ContractFields.Where(ctFld => ctFld.ContractID == ContractID && ctFld.FieldGroupID == FieldGroupID).Select(cFld => new EntityRecordValues { ContractID = cFld.ContractID, FieldGroupID = cFld.FieldGroupID, FieldID = cFld.FieldID, FieldValue = cFld.FieldValue, FieldCurrencyID = cFld.FieldCurrencyID, FieldType = cFld.Field.FieldType }).ToList();
            //}

            //Logger.WriteGeneralVerbose("DataHandlerPartial_SysTables - GetSelectorFieldValues", "returning the entity record values of a selector field with id {0}", FieldId);
            return selectorFldVals;
        }


        /// <summary>
        /// Used to get Contract Fields (entity records in case of entities) of a contract by using 
        /// Contract ID
        /// </summary>
        /// <param action="ContractID">ID of the contract whose contract fields have to be fetched.</param>
        /// <param action="CultureIdentifier">Culture Identitier of the user.</param>
        /// <returns>List of Contract Fields of a contract.</returns>
        public static List<ContractField> GetEntityRecordsByContractID(long ContractID, string CultureIdentifier)
        {

            //*******conditions implemented for display all fields according to display order or alphabatically********//
            //Viplav 6-May-2013
            //************************************
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            List<ContractField> entityRecords = new List<ContractField>();
            List<TopContractsEntities.ContractField> fieldslist = new List<TopContractsEntities.ContractField>();

            if (context.ContractFields.Where(ctFld => ctFld.ContractID == ContractID).Any(entry => entry.Field.DisplayOrder == null) == false)
                fieldslist = context.ContractFields.Where(ctFld => ctFld.ContractID == ContractID).OrderBy(ent => ent.Field.DisplayOrder).ToList();
            else
                fieldslist = context.ContractFields.Where(ctFld => ctFld.ContractID == ContractID).OrderBy(e => e.Field.FieldsLNGs.FirstOrDefault(o => o.CultureId == CultureIdentifier).DescShort).ToList();

            foreach (TopContractsEntities.ContractField efContractField in fieldslist)
            {
                entityRecords.Add(new ContractField(efContractField, CultureIdentifier));
            }
            return entityRecords;
        }

        public static TopContractsDAL10.SystemTables.FieldGroup GetCatalogWithFields(long FieldID, string CultureIdentifier)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            TopContractsDAL10.SystemTables.FieldGroup fieldGroup = null;

            if (context.Fields.Any(fld => fld.FieldID == FieldID))
            {
                TopContractsEntities.Field efField = context.Fields.SingleOrDefault(fld => fld.FieldID == FieldID);

                if (efField.FieldType == (int)FieldTypes.EntityLink && efField.LinkedEntityID != null)
                {
                    if (context.FieldGroupsContractTypesMAPs.Any(ct => ct.ContractTypeID == efField.LinkedEntityID) && context.FieldGroupsContractTypesMAPs.Count(ct => ct.ContractTypeID == efField.LinkedEntityID) == 1)
                    {
                        TopContractsEntities.FieldGroup efFieldGroup = context.FieldGroupsContractTypesMAPs.SingleOrDefault(ct => ct.ContractTypeID == efField.LinkedEntityID).FieldGroup;
                        fieldGroup = new TopContractsDAL10.SystemTables.FieldGroup(efFieldGroup);
                    }
                }
            }
            return fieldGroup;
        }

        public long Save(TopContractsDAL10.DasboardTables.SaveSearch search, bool overwrite, long searchID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.SaveSearch efSearch = null;
            if (searchID == 0)
            {
                efSearch = new TopContractsEntities.SaveSearch();
            }
            else
            {
                efSearch = context.SaveSearches.Where(c => c.SearchId == searchID).SingleOrDefault();
            }

            efSearch.SearchQuery = search.SearchQuery;
            efSearch.OrganizationIdentifier = this.organizationIdentifier;
            efSearch.Name = search.Name;
            efSearch.Description = search.Description;
            efSearch.DisplayOrder = search.DisplayOrder;
            efSearch.UpdateDate = DateTime.Now;
            efSearch.UpdateUserID = search.UpdateUserId;
            //efSearch.Inactive = true;
            efSearch.Inactive = false;
            if (!overwrite)
            {
                efSearch.UserId = search.UserId;
                efSearch.Shared = search.Shared;
                efSearch.DateCreated = search.CreatedDate;
            }

            //Added By Salil + Boaz
            //1-May-2013
            if (search.searchResultsContracts != null)
                if (search.searchResultsContracts.Entries != null)
                    if (search.searchResultsContracts.Entries.Count > 0)
                    {
                        foreach (TopContractsDAL10.DasboardTables.SearchResultsContract _searchResultsContracts in search.searchResultsContracts.Entries)
                        {
                            context.SearchResultsContracts.Add(new TopContractsEntities.SearchResultsContract() { SearchId = _searchResultsContracts.SearchId, ContractId = _searchResultsContracts.ContractId });
                        }
                    }
            if (!overwrite)
                context.SaveSearches.Add(efSearch);
            context.SaveChanges();
            return Convert.ToInt64(efSearch.SearchId);
        }

        /// <summary>
        /// Used to save Field Group Role Map when limited Role entered in Role Table
        /// </summary>
        public void SaveFieldGroupsRolesMAPforLimitedUser()
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName()); ;
            TopContractsDAL10.SystemTables.FieldGroups fieldGroups = new SystemTables.FieldGroups();
            foreach (TopContractsEntities.FieldGroup fldGrp in context.FieldGroups.Where(fld => fld.RolesVisibility == (byte)FieldGroupRoleVisibility.VisibleToAll))
            {
                fldGrp.RolesVisibility = (byte)FieldGroupRoleVisibility.VisibleToRoles;
                //Adding entries in FieldGroupsRolesMAP according to roles and efFieldGroupsForContractInit
                foreach (TopContractsEntities.Role role in context.Roles.Where(rl => rl.EditFields == null || rl.EditFields == false))
                {
                    fldGrp.FieldGroupsRolesMAPs.Add(new FieldGroupsRolesMAP() { OrganizationIdentifier = this.organizationIdentifier, RoleID = role.RoleID, FieldGroupID = fldGrp.FieldGroupID, AllowView = true, AllowEdit = true });
                }
            }
            context.SaveChanges();
        }

        public void SaveEntityFieldsCopyInContract(ContractTypes entities)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
            List<long?> recordcounters = new List<long?>();
            TopContractsEntities.FieldGroup entityFieldGroup = null;
            foreach (TopContractsDAL10.SystemTables.ContractType entity in entities.Entries)
            {
                if (context.Fields.Any(fld => fld.LinkedEntityID == entity.ID))
                {
                    if (context.FieldGroupsContractTypesMAPs.Any(f => f.ContractTypeID == entity.ID) && context.FieldGroupsContractTypesMAPs.Count(f => f.ContractTypeID == entity.ID) == 1)
                    {
                        entityFieldGroup = context.FieldGroupsContractTypesMAPs.First(f => f.ContractTypeID == entity.ID).FieldGroup;
                    }
                    // code area to a create a new contract field entry if an entity field has been selected to make a
                    // copy in contract.
                    foreach (ContractTypesFieldsToCreateDefault DefEntFld in entity.DefaultEntityFields.Where(fld => fld.Deleted == false))
                    {
                        //foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID && c.ContractFields.Any(cf => cf.FieldID == DefEntFld.FieldID) == false))
                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID && c.ContractFields.Any(cf => cf.CatalogFieldID == DefEntFld.FieldID) == false))
                        {
                            foreach (TopContractsEntities.Field field in context.Fields.Where(fg => fg.LinkedEntityID == DefEntFld.ContractTypeID))
                            {
                                //if (contract.ContractFields.Any(cf => cf.FieldID == DefEntFld.FieldID && cf.FieldGroupID == fieldGroupId) == false)
                                if (contract.ContractFields.Any(cf => cf.CatalogFieldID == DefEntFld.FieldID && cf.FieldGroupID == field.FieldGroupID) == false)
                                {
                                    recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == field.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                    TopContractsEntities.Field efDefFld = context.Fields.Where(defld => defld.FieldID == DefEntFld.FieldID).SingleOrDefault();
                                    if (recordcounters.Count > 0)
                                    {
                                        foreach (long? recordcounter in recordcounters)
                                        {
                                            contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                            {
                                                FieldGroupID = field.FieldGroupID,
                                                FieldID = field.FieldID,
                                                CatalogFieldID = efDefFld.FieldID,
                                                FieldValue = (efDefFld.FieldType == (int)FieldTypes.ListSingle && efDefFld.FieldListItems.Count > 0 && efDefFld.UseFirstAsDefault == true ? efDefFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                                RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                            });
                                        }
                                    }
                                    //else
                                    //{
                                    //    contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                    //    {
                                    //        FieldGroupID = efFld.FieldGroupID,
                                    //        FieldID = efDefFld.FieldID,
                                    //        FieldValue = (efDefFld.FieldType == (int)FieldTypes.ListSingle && efDefFld.FieldListItems.Count > 0 && efDefFld.UseFirstAsDefault == true ? efDefFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                    //        RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                    //    });
                                    //}
                                }
                            }
                        }
                    }

                    foreach (long fieldGroupId in context.Fields.Where(fg => fg.LinkedEntityID == entity.ID).Select(u => u.FieldGroupID))
                    {
                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID))
                        {
                            foreach (TopContractsEntities.ContractField cFld in contract.ContractFields.Where(cf => cf.FieldGroupID == fieldGroupId).ToList())
                            {
                                if (entity.DefaultEntityFields.Any(f => f.FieldID == cFld.FieldID) == false)
                                {
                                    if (context.Fields.Any(f => f.FieldID == cFld.FieldID))
                                    {
                                        TopContractsEntities.FieldGroup fieldgroup = context.Fields.SingleOrDefault(f => f.FieldID == cFld.FieldID).FieldGroup;

                                        if (entityFieldGroup != null)
                                            if (entityFieldGroup.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && entityFieldGroup.FieldGroupsContractTypesMAPs.ToList().Count == 1)
                                            {
                                                if (entityFieldGroup.FieldGroupsContractTypesMAPs.First().ContractType.ParentContractTypeID != ContractTypeContractsID && entityFieldGroup.FieldGroupsContractTypesMAPs.First().ContractTypeID != ContractTypeContractsID)
                                                {
                                                    if (entityFieldGroup.FieldGroupID == fieldgroup.FieldGroupID)
                                                        context.ContractFields.Remove(cFld);
                                                }
                                            }
                                        //if (entities.Cast<TopContractsDAL10.SystemTables.ContractType>().Any(ent => ent.ID == fieldgroup.FieldGroupID))
                                        //{
                                        //    context.ContractFields.Remove(cFld);
                                        //}
                                    }
                                }
                            }
                        }
                    }
                }
            }
            context.SaveChanges();
        }

        public void AddEntityRecordsForNewEntityFields()
        {
            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            foreach (TopContractsEntities.FieldGroup efFldGrp in context.FieldGroups.Where(fgrp => fgrp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToTypes && fgrp.FieldGroupsContractTypesMAPs.Any(cTypeMap => cTypeMap.ContractType.ParentContractTypeID != ContractTypeContractsID || cTypeMap.ContractType.ParentContractTypeID == null) == true))
            {
                List<long> contractIDs = new List<long>();

                if (efFldGrp.FieldGroupsContractTypesMAPs != null)
                    foreach (FieldGroupsContractTypesMAP fgcMap in efFldGrp.FieldGroupsContractTypesMAPs)
                    {
                        if (context.Contracts.Any(c => c.ContractTypeID == fgcMap.ContractTypeID))
                            contractIDs.AddRange(context.Contracts.Where(c => c.ContractTypeID == fgcMap.ContractTypeID && (c.ContractType.ParentContractTypeID != ContractTypeContractsID || c.ContractType.ParentContractTypeID == null)).Select(c => c.ContractID));
                    }
                if (contractIDs.Count > 0)
                    foreach (TopContractsEntities.Field efFld in efFldGrp.Fields)
                    {
                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(c => (c.ContractFields.Any(cf => cf.FieldID == efFld.FieldID) == false) && (c.ContractType.ParentContractTypeID != ContractTypeContractsID || c.ContractType.ParentContractTypeID == null)))
                        {
                            if (contractIDs.Contains(contract.ContractID))
                            {
                                //recordcounters = contract.ContractFields.Where(fg => fg.FieldGroupID == efFldGrp.FieldGroupID).Select(c => c.RecordCounter).Distinct().ToList();
                                //if (recordcounters.Count != 0)
                                //{
                                //    foreach (long? recordcounter in recordcounters)
                                //    {
                                //        contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                //        {
                                //            FieldGroupID = efFld.FieldGroupID,
                                //            FieldID = efFld.FieldID,
                                //            FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                //            RecordCounter = (recordcounter == null ? Convert.ToInt64(RecordCounter.Default) : recordcounter)
                                //        });
                                //    }
                                //}
                                //else
                                //{
                                contract.ContractFields.Add(new TopContractsEntities.ContractField()
                                {
                                    FieldGroupID = efFld.FieldGroupID,
                                    FieldID = efFld.FieldID,
                                    FieldValue = (efFld.FieldType == (int)FieldTypes.ListSingle && efFld.FieldListItems.Count > 0 && efFld.UseFirstAsDefault == true ? efFld.FieldListItems.First().FieldListItemID.ToString() : ""),
                                    RecordCounter = Convert.ToInt64(RecordCounter.Default)
                                });
                                //}

                            }
                        }
                    }
            }
            context.SaveChanges();
        }

        public int Save(DashboardCs Data, int UpdatingUserID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            TopContractsEntities.DashboardElement efdashboardElement = null;
            TopContractsEntities.DashboardElementDisplayValue efdashboardElementDisplayValue = null;
            foreach (TopContractsDAL10.DasboardTables.DashboardC dashboard in Data.Entries)
            {
                foreach (TopContractsDAL10.DasboardTables.DashboardElement dashboardElement in dashboard.DashboardElement.Entries)
                {
                    if (dashboardElement.New)
                    {
                        efdashboardElement = new TopContractsEntities.DashboardElement();
                    }
                    else
                    {
                        efdashboardElement = context.DashboardElements.Where(c => c.DashboardElementId == dashboardElement.ID).SingleOrDefault();
                    }

                    if (dashboardElement.Deleted == false)
                    {
                        efdashboardElement.OrganizationIdentifier = this.organizationIdentifier;
                        efdashboardElement.SearchId = dashboardElement.SearchId;
                        efdashboardElement.DashboardId = dashboardElement.DashboardId;
                        efdashboardElement.DisplaySeriesType = dashboardElement.DisplaySeriesType;
                        efdashboardElement.DisplaySizeHeight = dashboardElement.DisplaySizeHeight;
                        efdashboardElement.DisplaySizeWidth = dashboardElement.DisplaySizeWidth;
                        efdashboardElement.XAxis = dashboardElement.XAxis;
                        efdashboardElement.YAxis = dashboardElement.YAxis;
                        efdashboardElement.ElementType = dashboardElement.ElementType;
                        efdashboardElement.DisplayProperties = dashboardElement.DisplayProperties;
                        efdashboardElement.ScaleFormula = dashboardElement.ScaleFormula;
                        efdashboardElement.ScaleName = dashboardElement.ScaleName;
                        efdashboardElement.ChartTitle = dashboardElement.ChartTitle;
                        foreach (TopContractsDAL10.DasboardTables.DashboardElementDisplayValue DEValues in dashboardElement.DashboardElementDisplayValues.Entries)
                        {
                            if (DEValues.New)
                            {
                                efdashboardElementDisplayValue = new TopContractsEntities.DashboardElementDisplayValue();
                            }
                            else
                            {
                                efdashboardElementDisplayValue = context.DashboardElementDisplayValues.Where(c => c.DashboardElementDisplayId == DEValues.ID).SingleOrDefault();
                            }
                            if (DEValues.Deleted == false)
                            {
                                efdashboardElementDisplayValue.OrganizationIdentifier = this.organizationIdentifier;
                                efdashboardElementDisplayValue.DashboardElementId = DEValues.DashboardElementId;
                                efdashboardElementDisplayValue.Name = DEValues.Name;
                                efdashboardElementDisplayValue.Description = DEValues.Description;
                                efdashboardElementDisplayValue.Formula = DEValues.Formula;
                                efdashboardElementDisplayValue.DisplayOrder = DEValues.DisplayOrder;
                            }
                            if (DEValues.New)
                                efdashboardElement.DashboardElementDisplayValues.Add(efdashboardElementDisplayValue);
                            else
                            {
                                if (DEValues.Deleted && efdashboardElementDisplayValue != null)
                                {
                                    efdashboardElement.DashboardElementDisplayValues.Remove(efdashboardElementDisplayValue);
                                    context.DashboardElementDisplayValues.Remove(efdashboardElementDisplayValue);
                                }
                            }
                        }
                    }

                    if (dashboardElement.New)
                    {
                        efdashboardElement.UpdateDate = DateTime.Now;
                        efdashboardElement.UpdateUserID = UpdatingUserID;
                        context.DashboardElements.Add(efdashboardElement);
                    }
                    else
                    {
                        if (dashboardElement.Deleted && efdashboardElement != null)
                        {
                            foreach (TopContractsDAL10.DasboardTables.DashboardElementDisplayValue DEValues in dashboardElement.DashboardElementDisplayValues.Entries)
                            {
                                efdashboardElementDisplayValue = context.DashboardElementDisplayValues.Where(c => c.DashboardElementDisplayId == DEValues.ID).SingleOrDefault();
                                efdashboardElement.DashboardElementDisplayValues.Remove(efdashboardElementDisplayValue);
                                context.DashboardElementDisplayValues.Remove(efdashboardElementDisplayValue);
                            }
                            context.DashboardElements.Remove(efdashboardElement);
                        }
                    }
                }
            }

            bool updateDashBoardUpdateDetails = false;
            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.State == System.Data.EntityState.Added || entry.State == System.Data.EntityState.Modified)
                {
                    updateDashBoardUpdateDetails = true;
                }
            }
            if (updateDashBoardUpdateDetails)
                foreach (var entry in context.ChangeTracker.Entries())
                {
                    if (entry.Entity is TopContractsEntities.DashboardElement && (entry.State == EntityState.Added || entry.State == EntityState.Modified))
                    {
                        ((TopContractsEntities.DashboardElement)entry.Entity).UpdateDate = DateTime.Now;
                        ((TopContractsEntities.DashboardElement)entry.Entity).UpdateUserID = UpdatingUserID;
                    }
                }

            return context.SaveChanges();
        }

        /// <summary>
        /// This function will add the new dashboard
        /// </summary>
        /// <param action="objDashboardC"></param>
        /// <returns></returns>
        public int Save(TopContractsDAL10.DasboardTables.DashboardC objDashboardC)
        {
            int rtrnVal = 0;
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());

            Logger.WriteGeneralVerbose("DataHandler class - Save", "check for dashboard existance for userid {0}", objDashboardC.UserId);
            var dashBoardExist = context.Dashboards.FirstOrDefault(t => t.UserId == objDashboardC.UserId);
            if (dashBoardExist == null) //create new dashbaord over here
            {
                TopContractsEntities.Dashboard efDashBoard = new TopContractsEntities.Dashboard();

                efDashBoard.OrganizationIdentifier = this.organizationIdentifier;
                efDashBoard.Name = objDashboardC.Name;
                efDashBoard.Description = objDashboardC.Description;
                efDashBoard.UserId = objDashboardC.UserId;
                efDashBoard.DisplayOrder = objDashboardC.DisplayOrder;
                efDashBoard.UpdateDate = objDashboardC.UpdateDate;
                efDashBoard.UpdateUserID = objDashboardC.UpdateUserId;
                efDashBoard.Locked = objDashboardC.Locked;
                efDashBoard.Inactive = true;
                efDashBoard.ExternalID = objDashboardC.ExternalID;

                context.Dashboards.Add(efDashBoard);
                rtrnVal = context.SaveChanges();
                Logger.WriteGeneralVerbose("DataHandler class - Save", "dashboard is created for user with id {0}", rtrnVal);
            }
            return rtrnVal;
        }

        public static string ValidateDatabase(string cultureName, bool AllowContractUserAuthorization)
        {

            DataTestSuit testSuit1 = new DataTestSuit("Full suit");
            //DataTest t1 = testSuit1.AddTest("Action 1", "Test subject 1");
            //t1.Information = "Info about Test subject 1";
            //DataTestStep t11 = t1.AddStep("Step 1-1", "Test subject 1-1");
            //DataTestStep t111 = t11.AddStep("Step 1-1-1", "Test subject 1-1-1");
            //t111.Information = "Info about Test subject 1-1-1";
            //DataTestStep t12 = t1.AddStep("Step 1-2", "Test subject 1-2");
            //DataTest t2 = testSuit1.AddTest("Action 2", "Test subject 2");
            //DataTestStep t21 = t2.AddStep("Step 2-1", "Test subject 2-1");
            //t21.FailTest("Reason is...");

            //string theResults= testSuit1.HTMLResults();
            //return theResults;

            //List<TopContractsEntities.Contract> contractsList = null;
            //bool finalResultPassed = true;
            //string resultStr = "";

            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            //long ContractTypeContractsID = ConfigurationProvider.Default.ContractTypeContracts.ContractTypeContractsID;
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept

            #region Basic tests (i) To report error if system has no Currency, ContractType, Status, Message Type, Event Type. (ii) To report error if system has currencies, but system default currency is not defined.
            DataTest basicDataTest1 = testSuit1.AddTest("Basic tests of the system", "Checking for the existence of basic data in the system.");

            // reporting error if system has no Currencies
            DataTestStep basicTestStep1 = basicDataTest1.AddStep("Checking for the existence of Currencies", "Checking for the existence of at-least one currency in the system.");
            if (context.Currencies.Count() <= 0)
                basicTestStep1.FailTest("No currency exist in the system");
            else
                basicTestStep1.Information += string.Format("System contains {0} currencies", context.Currencies.Count());

            // reporting error if system has no Contract Types
            DataTestStep basicTestStep2 = basicDataTest1.AddStep("Checking for the existence of Contract Types", "Checking for the existence of at-least one contract type in the system.");
            if (context.ContractTypes.Count(pct => pct.ParentContractTypeID == ContractTypeContractsID) <= 0)
                basicTestStep2.FailTest("No contract type exist in the system");
            else
                basicTestStep2.Information += string.Format("System contains {0} contract types", context.ContractTypes.Count(pct => pct.ParentContractTypeID == ContractTypeContractsID));

            // reporting error if system has no Statuses
            DataTestStep basicTestStep3 = basicDataTest1.AddStep("Checking for the existence of Statuses", "Checking for the existence of at-least one status in the system.");
            if (context.Statuses.Count() <= 0)
                basicTestStep3.FailTest("No status exist in the system");
            else
                basicTestStep3.Information += string.Format("System contains {0} statuses", context.Statuses.Count());

            // reporting error if system has no Message Types
            DataTestStep basicTestStep4 = basicDataTest1.AddStep("Checking for the existence of Message Types", "Checking for the existence of at-least one message type in the system.");
            if (context.MsgTypes.Count() <= 0)
                basicTestStep4.FailTest("No message type exist in the system");
            else
                basicTestStep4.Information += string.Format("System contains {0} message types", context.MsgTypes.Count());

            // reporting error if system has no Event Types
            DataTestStep basicTestStep5 = basicDataTest1.AddStep("Checking for the existence of Event Types", "Checking for the existence of at-least one event type in the system.");
            if (context.EventTypes.Count() <= 0)
                basicTestStep5.FailTest("No event type exist in the system");
            else
                basicTestStep5.Information += string.Format("System contains {0} event types", context.EventTypes.Count());

            DataTest basicDataTest2 = testSuit1.AddTest("Checking for the existence of system's default currency", "System should have a default currency when more than one currencies exist.");
            // reporting error if system has currencies but system's default currency is not defined
            if (context.Currencies.Count() > 0)
            {
                DataTestStep basicTestStep6 = basicDataTest2.AddStep("Checking if system has currencies but default currency is not defined.", "System's default currency should be defined if system has more than one currency.");
                if (context.AppSettings.First().DefaultCurrencyId == null)
                    basicTestStep6.FailTest(string.Format("System's default currency is not defined even when system has {0} currencies.", context.Currencies.Count()));
                else
                {
                    long systemDefaultCurrencyId = Convert.ToInt64(context.AppSettings.First().DefaultCurrencyId);
                    if (systemDefaultCurrencyId > 0)
                    {
                        if (context.Currencies.Any(curr => curr.CurrencyID == systemDefaultCurrencyId) == false)
                            basicTestStep6.FailTest("A non-existing currency has been defined as a default currency of the system");
                        else
                            basicTestStep6.Information += string.Format("System default currency is {0}.", context.Currencies.SingleOrDefault(curr => curr.CurrencyID == systemDefaultCurrencyId).CurrenciesLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);
                    }
                }
            }

            #endregion

            #region ------------- Checking catalogs -------------------------------
            // Begining of TEST-1
            DataTest dataTest1 = testSuit1.AddTest("Checking catalogs", "All catalogs");
            // Checking if any entity exists in the system or not
            IQueryable<TopContractsEntities.ContractType> contractTypesQuery = context.ContractTypes.Where(pct => pct.ParentContractTypeID == null && pct.ContractTypeID != ContractTypeContractsID);
            if (contractTypesQuery.Count() > 0)
            {
                dataTest1.Information = string.Format("Checking integrity of {0} catalogs", contractTypesQuery.Count());
                // looping through all the entities
                foreach (TopContractsEntities.ContractType cType in contractTypesQuery)
                {
                    DataTestStep testStep = dataTest1.AddStep("Checking catalog", string.Format("Type #{0}: {1}", cType.ContractTypeID, cType.ContractTypesLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                    DataTestStep testStep1 = testStep.AddStep("Checking Selector field", "");
                    if (cType.SelectorFieldID == null || cType.ContractTypesFieldsToCreateDefaults == null)
                    {
                        testStep1.FailTest("No selector field and/or no fields-to-create in contracts");
                        continue; //Skipping next tests - they will probably fail as well
                    }
                    if (cType.ContractTypesFieldsToCreateDefaults.Any(ftc => ftc.FieldID == cType.SelectorFieldID) == false)
                    {
                        testStep1.FailTest(string.Format("Selector field #{0} has no Fields-to-create record", cType.SelectorFieldID));
                        continue; //Skipping next tests - they will probably fail as well
                    }
                    if (cType.ContractTypesFieldsToCreateDefaults.First(ftc => ftc.FieldID == cType.SelectorFieldID).Editable == false)
                    {
                        testStep1.FailTest(string.Format("Selector field #{0} fields-to-create record is marked as non-editable", cType.SelectorFieldID));
                    }

                    DataTestStep testStep2 = testStep.AddStep("Checking catalog-links to Field-Groups", "");
                    long contractTypesMAPs = 0;
                    try { contractTypesMAPs = cType.FieldGroupsContractTypesMAPs.Count(); }
                    catch { }
                    if (contractTypesMAPs == 0)
                        testStep2.PassTest("No linked groups");
                    else
                    {
                        //enumerating ALL field-groups of the system
                        foreach (TopContractsEntities.FieldGroup fldGroup in context.FieldGroups)
                        {
                            //this one is a "linked-group" - it contains a catalog-type field linked to the catalog being checked...
                            if (fldGroup.Fields.Any(flds => flds.LinkedEntityID == cType.ContractTypeID))
                            {
                                DataTestStep testStep3 = testStep2.AddStep("Checking linked-group", string.Format("Group #{0}-{1}", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));

                                // Added by Kai
                                foreach (TopContractsEntities.Field efFld in fldGroup.Fields.Where(flds => flds.LinkedEntityID == cType.ContractTypeID).AsQueryable())
                                {
                                    //enumerating all fields defined in the catalog
                                    foreach (TopContractsEntities.Field fld in cType.ContractTypesFieldsToCreateDefaults.First().Field.FieldGroup.Fields)
                                    {
                                        DataTestStep testStep4 = testStep3.AddStep("Checking the catalog-field", string.Format("Field #{0}-{1}", fld.FieldID, fld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                                        //Scan all contracts related to the field-group
                                        testStep4.Information = "Checking contracts: ";
                                        foreach (TopContractsEntities.Contract contract in context.Contracts.Where(ct => ct.ContractFields.Any(cf => cf.FieldGroupID == fldGroup.FieldGroupID)))
                                        {
                                            testStep4.Information += contract.ContractID.ToString() + ", ";
                                            bool tempIsSelector = (fld.FieldID == cType.SelectorFieldID);
                                            bool tempIsCopiedField = (cType.ContractTypesFieldsToCreateDefaults.Any(dfs => dfs.FieldID == fld.FieldID));
                                            //This is a selector field, or a field which needs to be copied
                                            if (tempIsSelector || tempIsCopiedField)
                                            {
                                                //Iterate through all records of each contract, and check that it contains such a field
                                                foreach (long recordCounter in contract.ContractFields.Where(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID).Select(cflds => cflds.RecordCounter).Distinct())
                                                {
                                                    //long tempCount = contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.RecordCounter == recordCounter && cflds.FieldID == fld.FieldID);

                                                    if (contract.ContractFields.Any(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.RecordCounter == recordCounter && cflds.FieldID == efFld.FieldID && cflds.CatalogFieldID == null))
                                                    {
                                                        // this if block will ensure that a record in ContractFields table exists for this catalog field, but it's CatalogFieldID is missing.
                                                        testStep4.FailTest(string.Format("The Field #{0} [{1}] of Group #{2} [{3}] is a catalog type field, but in contract #{4}, this field is missing the Original CatalogFieldID value (which should be {5}).", efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, contract.ContractID, fld.FieldID));
                                                    }
                                                    else
                                                    {
                                                        // this else block will ensure that no record exists in ContractFields table for this catalog field.
                                                        long tempCount = contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.RecordCounter == recordCounter && cflds.FieldID == efFld.FieldID && cflds.CatalogFieldID == fld.FieldID);
                                                        if (tempCount != 1)
                                                        {
                                                            testStep4.FailTest(string.Format("While this field {0}, In contract #{1}, there are {2} contract-fields associated with this field, instead of 1.",
                                                                (tempIsSelector ? "is a selector" : "needs to be copied into the contract"), contract.ContractID, tempCount));
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                if (contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == fld.FieldID) > 0)
                                                    testStep4.FailTest(string.Format("This non-selector/non-copied field is found in contract #{0}", contract.ContractID));
                                            }
                                        }

                                    }
                                }
                            }
                            else
                            {
                                if (groupBelongsToContracts(context, fldGroup))
                                {
                                    DataTestStep testStep3 = testStep2.AddStep("Checking non-linked group", string.Format("Group #{0}-{1}", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));

                                    //enumerating all fields defined in the catalog
                                    foreach (TopContractsEntities.Field fld in cType.ContractTypesFieldsToCreateDefaults.First().Field.FieldGroup.Fields)
                                    {
                                        //if (context.ContractFields.Any(cf => cf.FieldID == fld.FieldID && cf.FieldGroupID == fldGroup.FieldGroupID))
                                        if (context.ContractFields.Any(cf => cf.CatalogFieldID == fld.FieldID && cf.FieldGroupID == fldGroup.FieldGroupID))
                                        {
                                            testStep3.FailTest(string.Format("There are contracts containing catalog-type fields of #{0} inside group #{1}, which is not linked to the catalog.",
                                                fld.FieldID, fldGroup.FieldGroupID));
                                            testStep3.Information = string.Format(
                                                "To resolve this issue, delete all records from ContractFields Table, having FieldGroupId={0} and FieldID={1} and belonging to the following contracts: {2}"
                                                , fldGroup.FieldGroupID, fld.FieldID,
                                                string.Join(",", context.ContractFields.Where(cf => cf.FieldID == fld.FieldID && cf.FieldGroupID == fldGroup.FieldGroupID).Select(cf => cf.ContractID).Distinct().ToArray()));
                                        }
                                    }
                                }
                            }

                        }
                    }

                    #region --------- old code ------------

                    //// checking if this entity is used as a catalog field inside any fieldgroup
                    //if (context.Fields.Any(ent => ent.LinkedEntityID == cType.ContractTypeID && ent.FieldType == (int)FieldTypes.EntityLink))
                    //{
                    //    bool firstFieldInGroup = true;
                    //    // looping through all the entities which are used as a catalog field inside any fieldgroup
                    //    foreach (TopContractsEntities.Field fld in context.Fields.Where(ent => ent.LinkedEntityID == cType.ContractTypeID && ent.FieldType == (int)FieldTypes.EntityLink).ToList())
                    //    {
                    //        DataTestStep testStep4 = null;
                    //        DataTestStep testStep5 = null;
                    //        if (firstFieldInGroup)
                    //        {
                    //            testStep4 = testStep3.AddStep("Checking group",string.Format("Group #{0}-{1}", fld.FieldGroupID, fld.FieldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));                                
                    //            firstFieldInGroup = false;
                    //        }
                    //        else
                    //        {
                    //            testStep5 = testStep4.AddStep("Checking fields", string.Format("Field #{0}-{1}", fld.FieldID, fld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                    //        }
                    //        contractsList = new List<TopContractsEntities.Contract>();

                    //        // if field group is visibile to all contract types
                    //        if (fld.FieldGroup.ContractTypeVisibility == (long)FieldGroupContractTypeVisibility.VisibleToAll)
                    //        {
                    //            testStep4.Information = "mapped to all contract types";
                    //            contractsList = context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID).ToList();
                    //        }
                    //        // if field group is visible to specific contract types
                    //        else if (fld.FieldGroup.ContractTypeVisibility == (long)FieldGroupContractTypeVisibility.VisibleToTypes)
                    //        {
                    //            // looping through all the field group contract type maps to create a list of contracts
                    //            foreach (TopContractsEntities.FieldGroupsContractTypesMAP cTypeMap in context.FieldGroupsContractTypesMAPs.Where(f => f.FieldGroupID == fld.FieldGroupID).ToList())
                    //            {
                    //                // looping through all the contract types mapped to this field group and then adding into 
                    //                // the contractsList all the contracts mapped with the contract types.
                    //                foreach (TopContractsEntities.Contract efContract in cTypeMap.ContractType.Contracts.ToList())
                    //                {
                    //                    contractsList.Add(efContract);
                    //                }
                    //            }
                    //            testStep4.Information = string.Format("mapped to {0} contract types", contractsList.Count());
                    //        }

                    //        if (cType.FieldGroupsContractTypesMAPs != null)
                    //        {
                    //            // checking if the entity is mapped to an entity field group
                    //            if (cType.FieldGroupsContractTypesMAPs.Count() > 0)
                    //            {
                    //                // This is the field group which defines the entity
                    //                TopContractsEntities.FieldGroup entityFieldGroup = context.FieldGroupsContractTypesMAPs.Where(c => c.ContractTypeID == cType.ContractTypeID).First().FieldGroup;

                    //                bool fieldCheckOK = true;
                    //                foreach (TopContractsEntities.Field entityFld in entityFieldGroup.Fields.ToList())
                    //                {
                    //                    // case for a selector field || OR || case for an entity field which is visible inside the contract
                    //                    if (entityFld.FieldID == cType.SelectorFieldID || context.ContractTypesFieldsToCreateDefaults.Any(c => c.ContractTypeID == cType.ContractTypeID && c.FieldID == entityFld.FieldID))
                    //                    {
                    //                        // looping through all the contracts to ensure that this entity field is existing in the 
                    //                        // contract fields of all the contracts
                    //                        foreach (TopContractsEntities.Contract contract in contractsList)
                    //                        {
                    //                            if (contract.ContractFields.Any(f => f.FieldID == entityFld.FieldID) == false)
                    //                            {
                    //                                // this contract is not having this entity field, though it should have it.
                    //                                resultStr += string.Format("[X] failed for catalog field #{0} ({1}) - was defined as 'copy into contract', but is not found in contract #{2}; no more contracts are checked...",
                    //                                                           entityFld.FieldID, entityFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, contract.ContractID)
                    //                                                            + "<br/>";
                    //                                finalResultPassed = false;
                    //                                fieldCheckOK = false;
                    //                                break;
                    //                            }
                    //                        }
                    //                    }
                    //                    else
                    //                    {
                    //                        // case for an entity field which is not visible inside the contract
                    //                        if (context.ContractTypesFieldsToCreateDefaults.Any(c => c.ContractTypeID == cType.ContractTypeID && c.FieldID == entityFld.FieldID) == false)
                    //                        {
                    //                            // looping through all the contracts to ensure that this entity field is not existing in 
                    //                            // the contract fields of any contract.
                    //                            foreach (TopContractsEntities.Contract contract in contractsList)
                    //                            {
                    //                                if (contract.ContractFields.Any(f => f.FieldID == entityFld.FieldID))
                    //                                {
                    //                                    // this contract is having this entity field, though it should not have it.
                    //                                    finalResultPassed = false;
                    //                                    fieldCheckOK = false;
                    //                                    resultStr += string.Format("[X] failed for catalog field #{0} ({1}) - was defined as not 'copy into contract', but is nevertheless found in contract #{2}; no more contracts are checked...",
                    //                                                                entityFld.FieldID, entityFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, contract.ContractID)
                    //                                                                + "<br/>";
                    //                                    break;
                    //                                }
                    //                            }
                    //                        }
                    //                    }
                    //                }
                    //                if (fieldCheckOK == true)
                    //                    resultStr += "[V] pass..." + "<br/>";

                    //            }
                    //        }
                    //    }
                    //}
                    //else
                    //{
                    //    testStep3.PassTest("Is not contained in any field group");
                    #endregion
                }
            }
            else
                dataTest1.PassTest("No catalogs exist");

            #endregion

            #region oldcode2
            //else
            //{
            //    dataTest1.PassTest("No catalogs to check");
            //}


            //// Begining of TEST-2

            //// Checking if any field groups exists in the system or not
            ////Boaz - this query is wrong!
            ////IQueryable<TopContractsEntities.FieldGroup> fieldGroupsQuery = context.FieldGroups.Where(fgrp => fgrp.FieldGroupsContractTypesMAPs.Any(cTypeMap => (cTypeMap.ContractType.ParentContractTypeID != ContractTypeContractsID || cTypeMap.ContractType.ParentContractTypeID == null)));
            //IQueryable<TopContractsEntities.FieldGroup> fieldGroupsQuery = context.FieldGroups.Where(fgrp => fgrp.FieldGroupsContractTypesMAPs.Any(cTypeMap => (cTypeMap.ContractType.ParentContractTypeID != null)));
            //if (fieldGroupsQuery.Count() > 0)
            //{
            //    resultStr += "<br/><br/>" + string.Format("Test 2 - checking integrity of {0} field groups inside the contracts (i.e ContractFields)", fieldGroupsQuery.Count()) + "<br/>";
            //    foreach (TopContractsEntities.FieldGroup fldGroup in fieldGroupsQuery)
            //    {
            //        contractsList = new List<TopContractsEntities.Contract>();
            //        //contractsList.Clear();

            //        resultStr += string.Format("* checking integrity of fieldgroup of type #{0}-{1}: ", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);

            //        if (fldGroup.ContractTypeVisibility == (int)FieldGroupContractTypeVisibility.VisibleToAll)
            //        {
            //            resultStr += "(mapped to all contract types) " + "<br/>";
            //            contractsList = context.Contracts.Where(c => c.ContractType.ParentContractTypeID == ContractTypeContractsID).ToList();
            //        }
            //        else if (fldGroup.ContractTypeVisibility == (int)FieldGroupContractTypeVisibility.VisibleToTypes)
            //        {
            //            resultStr += "(mapped to specific contract types) " + "<br/>";

            //            foreach (TopContractsEntities.FieldGroupsContractTypesMAP cTypeMap in context.FieldGroupsContractTypesMAPs.Where(f => f.FieldGroupID == fldGroup.FieldGroupID).ToList())
            //            {
            //                // looping through all the contract types mapped to this field group and then adding into 
            //                // the contractsList all the contracts mapped with the contract types.
            //                foreach (TopContractsEntities.Contract efContract in cTypeMap.ContractType.Contracts.ToList())
            //                {
            //                    contractsList.Add(efContract);
            //                }
            //            }
            //        }

            //        foreach (TopContractsEntities.Field fld in fldGroup.Fields)
            //        {
            //            resultStr += string.Format("** checking integrity of field #{0} ({1}) of group #{2} ({3}): ",
            //                                               fld.FieldID, fld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);

            //            foreach (TopContractsEntities.Contract contract in contractsList)
            //            {
            //                if (contract.ContractFields.Any(cf => cf.FieldGroupID == fldGroup.FieldGroupID && cf.FieldID == fld.FieldID))
            //                {
            //                    finalResultPassed = true;
            //                    resultStr += "[V] pass..." + "<br/>";
            //                }
            //                else
            //                {
            //                    finalResultPassed = false;
            //                    resultStr += string.Format("[X] failed for field #{0} ({1}) of group #{2} ({3}) - as it is not found in contract #{4}; no more contracts are checked...",
            //                                                                        fld.FieldID, fld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, contract.ContractID) + "<br/>";
            //                }
            //            }
            //        }

            //        // Begining of TEST-3: check to ensure that single/multiple records field groups have correct number of records.
            //        resultStr += "<br/><br/>" + string.Format("Test 3 - checking the records of {0} field groups inside the contracts (i.e ContractFields)", fieldGroupsQuery.Count()) + "<br/>";

            //        if (Convert.ToBoolean(fldGroup.SingleRecord))
            //        {
            //            resultStr += string.Format("fieldgroup of type #{0}-{1} is a single record field group. It can have only one record in a contract.", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);

            //            foreach (TopContractsEntities.Contract efContract in contractsList)
            //            {
            //                foreach (TopContractsEntities.Field efFld in fldGroup.Fields)
            //                {
            //                    resultStr += string.Format("checking for the existance of records for field #{0}-{1} of field group #{2}-{3} in contract #{4}-{5}: ", efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name);

            //                    // checking to ensure that this field exists only once in this contract and its record counter is -999999
            //                    if (efContract.ContractFields.Count(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID) == 1)
            //                    {
            //                        if (efContract.ContractFields.Where(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID).Max(f => f.RecordCounter) == (long)RecordCounter.Default)
            //                        {
            //                            resultStr += "[V] pass..." + "<br/>";
            //                            finalResultPassed = true;
            //                        }
            //                        else
            //                        {
            //                            resultStr += string.Format("[X] failed for field #{0} ({1}) of field group #{2} ({3}) - as this field can have a record counter value: -999999, but contract #{4} ({5}) has this field with record counter value: {6} (which is wrong); no more contracts are checked...",
            //                                                                      efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name, efContract.ContractFields.Where(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID).Max(f => f.RecordCounter)) + "<br/>";

            //                            finalResultPassed = false;
            //                        }
            //                    }
            //                    else
            //                    {
            //                        resultStr += string.Format("[X] failed for field #{0} ({1}) as field group #{2} ({3}) was defined as a 'Single Record' field group, but contract #{4} ({5}) has {6} record for this field; no more contracts are checked...",
            //                                                                       efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name, efContract.ContractFields.Count(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID)) + "<br/>";

            //                        finalResultPassed = false;
            //                    }
            //                }
            //            }
            //        }
            //        else
            //        {
            //            resultStr += string.Format("fieldgroup of type #{0}-{1} is a multiple records field group. It can have any number of records in a contract.", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);

            //            foreach (TopContractsEntities.Contract efContract in contractsList)
            //            {
            //                foreach (TopContractsEntities.Field efFld in fldGroup.Fields)
            //                {
            //                    resultStr += string.Format("checking for the existance of records for field #{0}-{1} of field group #{2}-{3} in contract #{4}-{5}: ", efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name);

            //                    if (efContract.ContractFields.Count(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID) == 1)
            //                    {
            //                        if (efContract.ContractFields.Where(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID).Max(f => f.RecordCounter) == (long)RecordCounter.Default || efContract.ContractFields.Where(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID).Max(f => f.RecordCounter) == 1)
            //                        {
            //                            resultStr += "[V] pass..." + "<br/>";
            //                            finalResultPassed = true;
            //                        }
            //                        else
            //                        {
            //                            resultStr += string.Format("[X] failed for field #{0} ({1}) of field group #{2} ({3}) - as only one record for this field exists in the contract #{4} ({5}) but with Recourd Counter value other than -999999; no more contracts are checked...",
            //                                                                       efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name) + "<br/>";
            //                            finalResultPassed = false;
            //                        }
            //                    }
            //                    else if (efContract.ContractFields.Count(f => f.FieldID == efFld.FieldID && f.FieldGroupID == fldGroup.FieldGroupID) > 1)
            //                    {
            //                        // resultStr += string.Format("[X] failed for field #{0} ({1}) as field group #{2} ({3}) was defined as a 'Single Record' field group, but contract #{4} ({5}) has multiple record for this field; no more contracts are checked...",
            //                        //                                              efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Action) + "<br/>";
            //                        resultStr += "[V] pass..." + "<br/>";
            //                        finalResultPassed = false;
            //                    }
            //                    else
            //                    {
            //                        resultStr += string.Format("[X] failed for field #{0} ({1}) of field group #{2} ({3}) - as no record for this field exists in the contract #{4} ({5}); no more contracts are checked...",
            //                                                                       efFld.FieldID, efFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, efContract.ContractID, efContract.Name) + "<br/>";
            //                        finalResultPassed = false;
            //                    }
            //                }
            //            }
            //        }
            //        resultStr += string.Format("Test 3 is completed...") + "<br/>";
            //    }
            //}
            //else
            //{
            //    resultStr += string.Format("Test 2 passed - no field groups to check") + "<br/>";
            //    finalResultPassed = true;
            //}
            #endregion

            #region ------------------------------ Checking Field groups ----------------
            DataTest dataTest2 = testSuit1.AddTest("Checking field-groups", "Standard field-groups of standard contracts");
            foreach (TopContractsEntities.FieldGroup fldGroup in context.FieldGroups)
            {
                if (groupBelongsToContracts(context, fldGroup))
                {
                    DataTestStep testStep1 = dataTest2.AddStep("Checking field group", string.Format("field group #{0} ({1})", fldGroup.FieldGroupID, fldGroup.FieldGroupsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));

                    testStep1.Information = "Checking contracts: ";
                    //checking all contracts related to this field group
                    foreach (TopContractsEntities.Contract contract in fldGroup.ContractFields.Select(cf => cf.Contract).Distinct())
                    {
                        testStep1.Information += contract.ContractID.ToString() + ", ";
                        //Checking each contract against the fields of this group
                        foreach (TopContractsEntities.Field field in fldGroup.Fields)
                        {
                            int fieldCount = 0;
                            long fieldIdToCheck = getFieldIdForContractFields(field);
                            //foreach (long recordCounter in contract.ContractFields.Where(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == fieldIdToCheck).Select(cflds => cflds.RecordCounter).Distinct())
                            //{
                            //    if ((fieldCount = contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == fieldIdToCheck && cflds.RecordCounter == recordCounter)) != 1)
                            //    {
                            //        testStep1.FailTest(string.Format("Contract #{0} contains {1} fields of #{2} in record #{3}, instead of 1.", contract.ContractID, fieldCount, fieldIdToCheck, recordCounter));
                            //    }
                            //}

                            if (field.FieldType == (byte)FieldTypes.EntityLink)
                            {
                                foreach (long recordCounter in contract.ContractFields.Where(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == field.FieldID && cflds.CatalogFieldID == fieldIdToCheck).Select(cflds => cflds.RecordCounter).Distinct())
                                {
                                    if ((fieldCount = contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == field.FieldID && cflds.CatalogFieldID == fieldIdToCheck && cflds.RecordCounter == recordCounter)) != 1)
                                    {
                                        testStep1.FailTest(string.Format("Contract #{0} contains {1} fields of #{2} in record #{3}, instead of 1.", contract.ContractID, fieldCount, fieldIdToCheck, recordCounter));
                                    }
                                }
                            }
                            else
                            {
                                foreach (long recordCounter in contract.ContractFields.Where(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == fieldIdToCheck).Select(cflds => cflds.RecordCounter).Distinct())
                                {
                                    if ((fieldCount = contract.ContractFields.Count(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID && cflds.FieldID == fieldIdToCheck && cflds.RecordCounter == recordCounter)) != 1)
                                    {
                                        testStep1.FailTest(string.Format("Contract #{0} contains {1} fields of #{2} in record #{3}, instead of 1.", contract.ContractID, fieldCount, fieldIdToCheck, recordCounter));
                                    }
                                }
                            }
                        }

                        //Checking all contract-fields of that group, to see whether we have any that is not defined in the original field-group...
                        foreach (TopContractsEntities.ContractField contractField in contract.ContractFields.Where(cflds => cflds.FieldGroupID == fldGroup.FieldGroupID))
                        {
                            long contractFieldIdTocheck = getFieldIdFromContractFieldId(context, contractField);
                            if (fldGroup.Fields.Any(fs => fs.FieldID == contractFieldIdTocheck) == false)
                            {
                                testStep1.FailTest(string.Format("Contract #{0} contains field #{1} of group #{2} where the definition of this group does not contain this field",
                                    contract.ContractID, contractFieldIdTocheck, contractField.FieldGroupID));
                            }
                        }
                    }
                }
            }

            #endregion

            #region ------------------------------ Checking contracts' authorized users ----------------

            //Checking that no contract has 0 owners, and that all contracts in systems other than BE have only one owner
            DataTest dataTest3 = testSuit1.AddTest("Checking contracts", "all contracts");

            #region old code 3

            //*********************************************************************
            // code commented by viplav for resolving owner concept in application
            //*********************************************************************
            //foreach (TopContractsEntities.Contract contract in context.Contracts.Where(con => con.ContractType.ParentContractTypeID == ContractTypeContractsID))
            //{
            //    DataTestStep testStep5 = dataTest3.AddStep("Checking contract", string.Format("Contract #{0} - {1}", contract.ContractID, contract.Name));
            //    int contractOwners = contract.ContractUsers.Count(cu => cu.RoleID == (long)TopContractsCommon10.SpecialRoles.OwnerRoleID);
            //    if (contractOwners == 0)
            //    {
            //        testStep5.FailTest("Contract has no owners");
            //    }
            //    if (contractOwners > 1 && AllowContractUserAuthorization)
            //    {
            //        testStep5.FailTest("Contract has more than one owner");
            //    }
            //    //AllowContractUserAuthorization
            //}
            //*********************************************************************
            // code commented by viplav for resolving owner concept in application
            //*********************************************************************
            #endregion

            //Checking that no limited-users are assigned any non-limited roles in any of the contracts...
            DataTest dataTest4 = testSuit1.AddTest("Checking users", "all users");
            DataTestStep testStep6 = dataTest3.AddStep("Checking limited users", "Limited users: ");
            List<long> failedUsers = new List<long>();
            foreach (TopContractsEntities.User user in context.Users.Where(u => u.Unrestricted != true))
            {
                DataTestStep testStep7 = testStep6.AddStep("Checking limited user", user.FirstName + " " + user.LastName);
                //Role.EditFields=true actually means that the role is limited!
                if (context.ContractUsers.Any(cu => cu.UserID == user.UserID && cu.Role.EditFields == false))
                {
                    testStep6.FailTest(string.Format("User {0} has an unlimied role in the following contracts: {1}", user.UserID,
                                       string.Join(",", context.ContractUsers.Where(cu => cu.UserID == user.UserID && cu.Role.EditFields == false).Select(cu => cu.ContractID).Distinct().ToArray())));
                }

            }
            #endregion

            #region Scans for all the SavedSearchID of Dashboard elements and checks whether the SearchIDs exists or not
            DataTest dataTest5 = testSuit1.AddTest("Checking SearchIds", "all dashboard elements saved search ids");

            foreach (TopContractsEntities.DashboardElement efDashElem in context.DashboardElements.ToList())
            {
                DataTestStep testStep8 = dataTest5.AddStep("Checking Dashboard Elements", string.Format("Dashboard Element ID #{0} ({1})", efDashElem.DashboardElementId, efDashElem.ChartTitle));

                testStep8.Information = string.Format("Checking for this existence of SearchId: #{0}", efDashElem.SearchId);

                if (context.SaveSearches.Any(srch => srch.SearchId == efDashElem.SearchId) == false)
                {
                    testStep8.FailTest(string.Format("Dashboard element #{0} - ({1}) contains SearchID #{2} which does not exist.", efDashElem.DashboardElementId, efDashElem.ChartTitle, efDashElem.SearchId));
                }
            }
            #endregion

            #region Scans for all calculated fields and check that fields existing in the formulas is existing in the database
            DataTest dataTest6 = testSuit1.AddTest("Checking calculated fields", "formulas of all calculated fields");
            foreach (TopContractsEntities.Field calcFld in context.Fields.Where(fld => (fld.FieldType == (byte)FieldTypes.CalculatedRealNumber || fld.FieldType == (byte)FieldTypes.CalculatedCurrency) && fld.Formula.Length > 0).ToList())
            {
                DataTestStep testStep9 = dataTest6.AddStep("Checking calculated field", string.Format("field #{0} ({1})", calcFld.FieldID, calcFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                List<long> fieldIDsInFormula = TopContractsCommon10.Utilities.GetFieldIDsFromFormula(calcFld.Formula);
                testStep9.Information = "Checking for this existence of Fields: ";
                foreach (long fieldId in fieldIDsInFormula)
                {
                    testStep9.Information += fieldId + ", ";
                    if (context.Fields.Any(fld => fld.FieldID == fieldId) == false)
                    {
                        testStep9.FailTest(string.Format("Calculated field #{0} - ({1}) has formula that contains a non existing field #{2}).", calcFld.FieldID, calcFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, fieldId));
                    }
                }
            }
            #endregion

            #region Scans all the document type fields and check their LinkedDocumentID is existing in the same contract
            DataTest dataTest7 = testSuit1.AddTest("Checking document type fields", "Checking for the existence of LinkedDocumentID of document type fields in the same contract");
            foreach (TopContractsEntities.Field docFld in context.Fields.Where(fld => fld.FieldType == (byte)FieldTypes.DocumentLink))
            {
                DataTestStep testStep10 = dataTest7.AddStep("Checking document field", string.Format("field #{0} ({1})", docFld.FieldID, docFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                if (context.ContractFields.Any(fld => fld.FieldID == docFld.FieldID && fld.LinkedDocumentID != null))
                {
                    testStep10.Information = string.Format("Checking for the existence of LinkedDocumentID in contracts: ", docFld.FieldID, docFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);
                    foreach (TopContractsEntities.ContractField cFld in context.ContractFields.Where(fld => fld.FieldID == docFld.FieldID && fld.LinkedDocumentID != null))
                    {
                        testStep10.Information += cFld.ContractID + ", ";
                        if (context.ContractDocs.Any(cDoc => cDoc.ContractID == cFld.ContractID && cDoc.DocumentID == cFld.LinkedDocumentID) == false)
                        {
                            testStep10.FailTest(string.Format("Document type field #{0} ({1}) existing in contract {2} ({3}) contains LinkedDocumentID ({4}) which is not existing in the same contract.", docFld.FieldID, docFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, cFld.ContractID, cFld.Contract.Name, cFld.LinkedDocumentID));
                        }
                    }
                }
                else
                {
                    testStep10.Information = "Not existing in any contract";
                }
            }
            #endregion

            #region Scans all the event type fields and check their LinkedEventID is existing in the same contract
            DataTest dataTest8 = testSuit1.AddTest("Checking event type fields", "Checking for the existence of LinkedEventID of event type fields in the same contract");
            foreach (TopContractsEntities.Field eventFld in context.Fields.Where(fld => fld.FieldType == (byte)FieldTypes.EventLink))
            {
                DataTestStep testStep11 = dataTest8.AddStep("Checking event field", string.Format("field #{0} ({1})", eventFld.FieldID, eventFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
                if (context.ContractFields.Any(fld => fld.FieldID == eventFld.FieldID && fld.LinkedEventID != null))
                {
                    testStep11.Information = string.Format("Checking for the existence of LinkedEventID in contracts: ", eventFld.FieldID, eventFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort);
                    foreach (TopContractsEntities.ContractField cFld in context.ContractFields.Where(fld => fld.FieldID == eventFld.FieldID && fld.LinkedEventID != null))
                    {
                        testStep11.Information += cFld.ContractID + ", ";
                        if (context.ContractActivities.Any(cDoc => cDoc.ContractID == cFld.ContractID && cDoc.ActivityID == cFld.LinkedEventID) == false)
                        {
                            testStep11.FailTest(string.Format("Event type field #{0} ({1}) existing in contract {2} ({3}) contains LinkedEventID ({4}) which is not existing in the same contract.", eventFld.FieldID, eventFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort, cFld.ContractID, cFld.Contract.Name, cFld.LinkedEventID));
                        }
                    }
                }
                else
                {
                    testStep11.Information = "Not existing in any contract";
                }
            }
            #endregion

            #region Scans all dashboard element and check that fields existing in the formulas exist in the field table
            DataTest dataTest9 = testSuit1.AddTest("Checking dashbaord element", "formulas of all dashboard elements");
            foreach (TopContractsEntities.DashboardElement dashElem in context.DashboardElements.ToList())
            {
                DataTestStep testStep12 = dataTest9.AddStep("Checking dashboard element", string.Format("element #{0} ({1})", dashElem.DashboardElementId, dashElem.ChartTitle));
                if (!string.IsNullOrEmpty(dashElem.ScaleFormula))
                {
                    List<long> fieldIDsInFormula = TopContractsCommon10.Utilities.GetFieldIDsFromDashboardFormula(dashElem.ScaleFormula);
                    testStep12.Information = "Checking for this existence of Fields: ";
                    foreach (long fieldId in fieldIDsInFormula)
                    {
                        testStep12.Information += fieldId + ", ";
                        if (context.Fields.Any(fld => fld.FieldID == fieldId) == false)
                        {
                            testStep12.FailTest(string.Format("dashboard element #{0} - ({1}) has formula that contains a non existing field #{2}).", dashElem.DashboardElementId, dashElem.ChartTitle, fieldId));
                        }
                    }
                }
                else
                {
                    testStep12.Information = "No scale formula";
                }

                DataTestStep testStep13 = testStep12.AddStep("Checking display value formulas", string.Format("for dashboard element #{0} ({1})", dashElem.DashboardElementId, dashElem.ChartTitle));
                //testStep13.Information = "Checking dashboard element display values: ";
                foreach (TopContractsEntities.DashboardElementDisplayValue dispVal in dashElem.DashboardElementDisplayValues)
                {
                    DataTestStep testStep14 = testStep13.AddStep("Checking formula for display value", string.Format("DashbaordElementDisplayID #{0} ({1})", dispVal.DashboardElementDisplayId, dispVal.Name));
                    if (!string.IsNullOrEmpty(dispVal.Formula))
                    {
                        List<long> fieldIDsInFormula = TopContractsCommon10.Utilities.GetFieldIDsFromDashboardFormula(dispVal.Formula);
                        testStep14.Information += "Checking for the existence of Fields: ";
                        foreach (long fieldId in fieldIDsInFormula)
                        {
                            testStep14.Information += fieldId + ", ";
                            if (context.Fields.Any(fld => fld.FieldID == fieldId) == false)
                            {
                                testStep14.FailTest(string.Format("dashboard element display value #{0} - ({1}) has formula that contains a non existing field #{2}).", dispVal.DashboardElementDisplayId, dispVal.Name, fieldId));
                            }
                        }
                    }
                    else
                    {
                        testStep14.Information = "No formula";
                    }
                }
            }
            #endregion

            #region Scan all the catalog type fields and check whether LinkedEntityID exists or not.

            DataTest dataTest10 = testSuit1.AddTest("Checking all Catalog type fields", "Checking LinkedEntityID for all Catalog type fields");
            dataTest10.Information += "Catalog type fields: ";
            foreach (TopContractsEntities.Field catalogFld in context.Fields.Where(fld => fld.FieldType == (byte)FieldTypes.EntityLink))
            {
                dataTest10.Information += catalogFld.FieldID + ", ";
                if (catalogFld.LinkedEntityID == null)
                    dataTest10.FailTest(string.Format("System contains a catalog type field #{0} ({1}) which does not have any LinkedEntityID.", catalogFld.FieldID, catalogFld.FieldsLNGs.SingleOrDefault(lng => lng.CultureId.Trim() == cultureName).DescShort));
            }

            #endregion

            return testSuit1.HTMLResults();
        }

        /// <summary>
        ///Here we determine whether a Field-Group is of the kind defining a catalog (then the function returns false),
        ///or it is one that is used by normal contracts (and then the function returns true)
        /// </summary>
        /// <param name="context">The EF context to use for the check</param>
        /// <param name="fldGroup">The field group to check</param>
        /// <returns></returns>
        private static bool groupBelongsToContracts(TopContractsV01Entities context, TopContractsEntities.FieldGroup fldGroup)
        {
            if (fldGroup.ContractTypeVisibility == (byte)TopContractsCommon10.FieldGroupContractTypeVisibility.VisibleToAll)
                return true;
            if (fldGroup.FieldGroupsContractTypesMAPs != null)
            {
                FieldGroupsContractTypesMAP contractTypeMap = fldGroup.FieldGroupsContractTypesMAPs.FirstOrDefault();

                if (contractTypeMap != null)
                    if (contractTypeMap.ContractType.ParentContractTypeID == Utilities.contractTypeContractsID) // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
                        return true;

            }
            return false;
        }

        /// <summary>
        /// Given a field-ID of a group-field which is of entity-type, this function returns the field-ID 
        /// used for  any contract-field created by that field (instead of the field-ID which would have been created
        /// there for any field which is not of entity-type.
        /// </summary>
        /// <param name="fld"></param>
        /// <returns></returns>
        private static long getFieldIdForContractFields(TopContractsEntities.Field fld)
        {
            if (fld.FieldType == (int)TopContractsCommon10.FieldTypes.EntityLink)
                if (fld.ContractType != null)
                    if (fld.ContractType.SelectorFieldID != null)
                        return (long)fld.ContractType.SelectorFieldID; //The ContractType is linked through the LinkedEntityId column of Fields table

            return fld.FieldID;
        }

        /// <summary>
        /// Given a field-ID of a contract-field which is of entity-type, this function returns the 
        /// field-ID of the corresponding field of the fields table (a group-field)
        /// </summary>
        /// <param name="context"></param>
        /// <param name="contractField"></param>
        /// <returns></returns>
        private static long getFieldIdFromContractFieldId(TopContractsV01Entities context, TopContractsEntities.ContractField contractField)
        {

            try
            {
                foreach (TopContractsEntities.Field field in contractField.FieldGroup.Fields.Where(flds => flds.ContractType != null))
                {
                    if (field.ContractType != null)
                    {
                        if (field.ContractType.ContractTypesFieldsToCreateDefaults.Any(ftc => ftc.FieldID == contractField.FieldID))
                            return field.FieldID;
                    }
                    //if (field.FieldType == (byte)TopContractsCommon10.FieldTypes.EntityLink)
                    //{
                    //    if (field.ContractType.SelectorFieldID == contractField.FieldID)
                    //        return field.FieldID;
                    //}
                    //else
                    //{
                    //    return field.ContractType.ContractTypesFieldsToCreateDefaults.Single(ftc => ftc.FieldID == contractField.FieldID).FieldID;
                    //}
                }
                return (long)contractField.FieldGroup.Fields.Where(flds => flds.ContractType != null).Single(flds => flds.ContractType.SelectorFieldID == contractField.FieldID).FieldID;
            }
            catch
            {
                return contractField.FieldID;
            }
        }

        public static long GetFieldGroupIDMappedToCatalog(long ContractTypeID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return context.FieldGroupsContractTypesMAPs.First(fg => fg.ContractTypeID == ContractTypeID).FieldGroupID;
        }

        public static bool IsCatalogMappedWithFields(long LinkedEntityId)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            if (context.Fields.Any(fld => fld.LinkedEntityID == LinkedEntityId))
            {
                return true;
            }
            else
            {
                return false;

            }
        }

        /// <summary>
        /// Method to retrieve Field Groups according to current user's existence in contracts
        /// </summary>
        /// <param name="CurrentUserID">ID of current logged in user</param>
        /// <returns>A list of Field Group IDs</returns>
        public static List<long> GetFilteredGroupsForSearch(long CurrentUserID)
        {
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            long ContractTypeContractsID = Utilities.contractTypeContractsID;
            List<long> contractIDs = context.Users.SingleOrDefault(usr => usr.UserID == CurrentUserID).ContractUsers.Where(cu => cu.UserID == CurrentUserID && cu.Contract.ContractType.ParentContractTypeID == ContractTypeContractsID).Select(cu => cu.ContractID).ToList();
            //List<TopContractsEntities.FieldGroup> efFieldGroups = context.ContractFields.Where(cfg => contractIDs.Contains(cfg.ContractID)).Select(cfg => cfg.FieldGroup).Distinct().ToList();
            List<long> FilteredFieldGroupIDs = context.ContractFields.Where(cfg => contractIDs.Contains(cfg.ContractID)).Select(cfg => cfg.FieldGroupID).Distinct().ToList();

            //List<TopContractsDAL10.SystemTables.FieldGroup> lstFieldGroups = new List<TopContractsDAL10.SystemTables.FieldGroup>();
            //foreach (TopContractsEntities.FieldGroup efFieldGroup in efFieldGroups)
            //{
            //    lstFieldGroups.Add(new TopContractsDAL10.SystemTables.FieldGroup(efFieldGroup));
            //}

            List<long> RoleIDs = context.Users.SingleOrDefault(usr => usr.UserID == CurrentUserID).ContractUsers.Where(cu => cu.UserID == CurrentUserID && cu.Contract.ContractType.ParentContractTypeID == ContractTypeContractsID).Select(cu => cu.RoleID).Distinct().ToList();
            List<long> d = context.FieldGroupsRolesMAPs.Where(fgmap => RoleIDs.Contains(fgmap.RoleID) && fgmap.AllowView == true).Select(fg => fg.FieldGroupID).Distinct().ToList();
            List<long> a = context.FieldGroupsRolesMAPs.Where(fgmap => RoleIDs.Contains(fgmap.RoleID) && fgmap.AllowView == true && (fgmap.FieldGroup.FieldGroupsContractTypesMAPs.Any(cTypeMap => cTypeMap.ContractType.ParentContractTypeID == ContractTypeContractsID))).Select(fg => fg.FieldGroupID).Distinct().ToList();
            return FilteredFieldGroupIDs;
        }

        public static List<long> GetFieldGroupsMappedToAllContractTypes()
        {
            long ContractTypeContractsID = Utilities.contractTypeContractsID; // Code implemented by Viplav on 17 june 2013 for remove webconfig concept
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return context.FieldGroups.Where(fgrp => fgrp.ContractTypeVisibility == (byte)FieldGroupContractTypeVisibility.VisibleToAll).Select(ctp => ctp.FieldGroupID).ToList();
        }

        public static List<long> GetFieldGroupIDsMappedToContractTypeID(long ContractTypeID)
        {
            long ContractTypeContractsID = Utilities.contractTypeContractsID;
            TopContractsV01Entities context = new TopContractsV01Entities(Utilities.getTestEnvName());
            return context.FieldGroupsContractTypesMAPs.Where(fg => fg.ContractTypeID == ContractTypeID).Select(fg => fg.FieldGroupID).ToList();
        }

        /// <summary>
        /// Updated the email/username in AuthUsers and OrganizationUsers table for a users record.
        /// </summary>
        /// <param name="currentEmail">Current email existing in the Auth database.</param>
        /// <param name="newEmail">New email to be set in the Auth database.</param>
        public void UpdateUserEmailInAuthDB(string currentEmail, string newEmail)
        {
            TopContractsAuthEntities.TopContractsAuthEntities authContext = new TopContractsAuthEntities.TopContractsAuthEntities();

            // Checks for the existence of this User's email in AuthUsers table.
            if (AuthUser.CheckAuthUserExistance(currentEmail))
            {
                TopContractsAuthEntities.AuthUser efAuthUser = authContext.AuthUsers.SingleOrDefault(usr => usr.Email == currentEmail);
                efAuthUser.Email = newEmail;

                authContext.SaveChanges();
            }
        }

        /// <summary>
        /// Removes entries from AuthUsers and OrganizationUsers (if exists) tables when a user is deleted from an organization
        /// </summary>
        /// <param name="deletedUserAccessIdentifier">Access Identifier of the deleted user.</param>
        /// <returns>Boolean value to specify whether user has been removed or not.</returns>
        public bool RemoveUserEntryFromAuthDB(string deletedUserAccessIdentifier, long deletedUserID, Guid OrganizationID)
        {
            bool result = false;

            TopContractsAuthEntities.TopContractsAuthEntities authContext = new TopContractsAuthEntities.TopContractsAuthEntities();
            TopContractsAuthEntities.AuthUser efAuthUser = null;

            // Checks for the existence of this User's email in AuthUsers table.
            if (AuthUser.CheckAuthUserExistance(deletedUserAccessIdentifier))
            {
                efAuthUser = authContext.AuthUsers.SingleOrDefault(usr => usr.Email == deletedUserAccessIdentifier);

                if (efAuthUser.OrganizationUsers.Count() > 1)
                {
                    if (efAuthUser.OrganizationUsers.Any(usr => usr.OrganizationIdentifier == OrganizationID && usr.UserId == efAuthUser.UserId && usr.SystemUserId == deletedUserID))
                    {
                        // removes this current org user entry from context
                        authContext.OrganizationUsers.Remove(efAuthUser.OrganizationUsers.SingleOrDefault(usr => usr.OrganizationIdentifier == OrganizationID && usr.UserId == efAuthUser.UserId && usr.SystemUserId == deletedUserID));
                    }
                }

                if (efAuthUser.OrganizationUsers.Count() == 1)
                {
                    authContext.OrganizationUsers.Remove(efAuthUser.OrganizationUsers.SingleOrDefault(usr => usr.OrganizationIdentifier == OrganizationID && usr.UserId == efAuthUser.UserId && usr.SystemUserId == deletedUserID));
                    // removes auth user entry also
                    authContext.AuthUsers.Remove(efAuthUser);
                }

                int rowsAffected = authContext.SaveChanges();

                result = rowsAffected > 0;
            }

            return result;
        }

        public bool IsRolePermissionsChanged(DbEntityEntry entityEntry)
        {
            if (entityEntry.CurrentValues["ViewProperties"] != entityEntry.OriginalValues["ViewProperties"])
                return true;
            if (entityEntry.CurrentValues["EditProperties"] != entityEntry.OriginalValues["EditProperties"])
                return true;
            if (entityEntry.CurrentValues["ViewActivities"] != entityEntry.OriginalValues["ViewActivities"])
                return true;
            if (entityEntry.CurrentValues["EditActivities"] != entityEntry.OriginalValues["EditActivities"])
                return true;
            if (entityEntry.CurrentValues["AddActivities"] != entityEntry.OriginalValues["AddActivities"])
                return true;
            if (entityEntry.CurrentValues["DeleteActivities"] != entityEntry.OriginalValues["DeleteActivities"])
                return true;
            if (entityEntry.CurrentValues["ViewTodos"] != entityEntry.OriginalValues["ViewTodos"])
                return true;
            if (entityEntry.CurrentValues["EditTodos"] != entityEntry.OriginalValues["EditTodos"])
                return true;
            if (entityEntry.CurrentValues["AddTodos"] != entityEntry.OriginalValues["AddTodos"])
                return true;
            if (entityEntry.CurrentValues["DeleteTodos"] != entityEntry.OriginalValues["DeleteTodos"])
                return true;
            if (entityEntry.CurrentValues["ViewAuth"] != entityEntry.OriginalValues["ViewAuth"])
                return true;
            if (entityEntry.CurrentValues["EditAuth"] != entityEntry.OriginalValues["EditAuth"])
                return true;
            if (entityEntry.CurrentValues["ViewDocs"] != entityEntry.OriginalValues["ViewDocs"])
                return true;
            if (entityEntry.CurrentValues["EditDocs"] != entityEntry.OriginalValues["EditDocs"])
                return true;
            if (entityEntry.CurrentValues["AddDocs"] != entityEntry.OriginalValues["AddDocs"])
                return true;
            if (entityEntry.CurrentValues["DeleteDocs"] != entityEntry.OriginalValues["DeleteDocs"])
                return true;
            if (entityEntry.CurrentValues["ViewApps"] != entityEntry.OriginalValues["ViewApps"])
                return true;
            if (entityEntry.CurrentValues["EditApps"] != entityEntry.OriginalValues["EditApps"])
                return true;
            if (entityEntry.CurrentValues["ViewGallery"] != entityEntry.OriginalValues["ViewGallery"])
                return true;
            if (entityEntry.CurrentValues["EditGallery"] != entityEntry.OriginalValues["EditGallery"])
                return true;
            if (entityEntry.CurrentValues["AddGallery"] != entityEntry.OriginalValues["AddGallery"])
                return true;
            if (entityEntry.CurrentValues["DeleteGallery"] != entityEntry.OriginalValues["DeleteGallery"])
                return true;

            return false;
        }

    }
}
