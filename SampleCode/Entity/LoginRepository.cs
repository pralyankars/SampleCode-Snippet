using Na.Core.Data;
using Na.Core.Domain.Users;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using Na.Core.Domain.Users;
using Na.Core.Model.UserLogin;
using Na.Core;

namespace Na.Data
{
    public class LoginRepository : EfRepository<User>, ILoginRepository
    {
        #region Fields
        private readonly IParameterManager _paramManager;
        private UnityOfWork _unitOfWork;
        //private readonly SqlSiteInfoContext _context; // Rakesh kumar  on 19 JUne 2013

        #endregion

        public LoginRepository(IParameterManager paramManage, UnityOfWork unitofWork)
            : base(unitofWork.SiteInfoContext)
        {
            _paramManager = paramManage;
            _unitOfWork = unitofWork;
        }
        /// <summary>
        /// Dealing with multiple databases and using Unit of Work
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <param name="loginOrResetLogin"></param>
        /// <param name="siteURL"></param>
        /// <param name="sessionId"></param>
        /// <returns></returns>
        public ValidateUserLogin ValidateUserLogin(string userName, string password, int loginOrResetLogin, string siteURL, string sessionId)
        {

            ValidateUserLogin userLoginDetails = validateUser(userName, password, loginOrResetLogin);
            Core.Domain.Users.User objUser = new Core.Domain.Users.User();  // Newly Added By Rakesh kumar on 19 June 2013
            LoginReportRepository loginReportRepository = new LoginReportRepository(_unitOfWork, _paramManager);
            if (userLoginDetails.User != null)
            {
                loginReportRepository.ReportUserLogin(userLoginDetails.User.UserId, siteURL, sessionId);
            }
            _unitOfWork.Commit(); // this will finally add the values to the database

            return userLoginDetails;
        }
        /// <summary>
        /// fetching the multiple table values for login in single hit
        /// </summary>
        /// <param name="UserName"></param>
        /// <param name="Password"></param>
        /// <param name="LoginOrResetLogin"></param>
        /// <returns></returns>
        private ValidateUserLogin validateUser(string UserName, string Password, int LoginOrResetLogin)
        {
            ValidateUserLogin objValidateUserLogin = new ValidateUserLogin();
            objValidateUserLogin = SprocExecuteMultipleList(UserName, Password, LoginOrResetLogin);
            return objValidateUserLogin;
        }

        public ValidateUserLogin SprocExecuteMultipleList(string UserName, string Password, int LoginOrResetLogin)
        {
            Na.Core.SharedInfo _sharedInfo = new Na.Core.SharedInfo();
            ValidateUserLogin _ValidateUserLoginModel = null;
            try
            {
                _ValidateUserLoginModel = new ValidateUserLogin();
                _unitOfWork.SiteInfoContext.Database.Initialize(force: false);
                var cmd = _unitOfWork.SiteInfoContext.Database.Connection.CreateCommand();

                cmd.CommandText = "SP_ValidateUserLogin";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                SqlParameter parm1 = new SqlParameter();
                parm1.ParameterName = "@UserName";
                parm1.Value = String.IsNullOrEmpty(UserName) ? (object)DBNull.Value : Convert.ToString(UserName.Trim());
                parm1.SqlDbType = SqlDbType.Text;
                SqlParameter parm2 = new SqlParameter();
                parm2.ParameterName = "@Password";
                parm2.Value = String.IsNullOrEmpty(Password) ? (object)DBNull.Value : Convert.ToString(Password.Trim());
                parm2.SqlDbType = SqlDbType.Text;
                SqlParameter parm3 = new SqlParameter();
                parm3.ParameterName = "@SessionID";
                parm3.Value = System.Web.HttpContext.Current.Session.SessionID;
                parm3.SqlDbType = SqlDbType.Text;
                SqlParameter parm4 = new SqlParameter();
                parm4.ParameterName = "@IP";
                parm4.Value = System.Web.HttpContext.Current.Request.UserHostAddress;
                parm4.SqlDbType = SqlDbType.Text;
                SqlParameter parm5 = new SqlParameter();
                parm5.ParameterName = "@LoginTime";
                parm5.Value = DateTime.Now;
                parm5.SqlDbType = SqlDbType.DateTime;
                SqlParameter parm6 = new SqlParameter();
                parm6.ParameterName = "@LoginExpiryTime";
                parm6.Value = DateTime.Now.AddMinutes(20d);
                parm6.SqlDbType = SqlDbType.DateTime;
                SqlParameter parm7 = new SqlParameter();
                parm7.ParameterName = "@LoginOrResetLogin";
                parm7.Value = LoginOrResetLogin;
                parm7.SqlDbType = SqlDbType.Int;

                cmd.Parameters.Add(parm1);
                cmd.Parameters.Add(parm2);
                cmd.Parameters.Add(parm3);
                cmd.Parameters.Add(parm4);
                cmd.Parameters.Add(parm5);
                cmd.Parameters.Add(parm6);
                cmd.Parameters.Add(parm7);
                if (_unitOfWork.SiteInfoContext.Database.Connection.State == ConnectionState.Closed)
                {
                    _unitOfWork.SiteInfoContext.Database.Connection.Open();
                }
                var reader = cmd.ExecuteReader();
                //LoginUserData
                var LoginUserValidateObject = (from n in ((IObjectContextAdapter)_unitOfWork.SiteInfoContext)
                           .ObjectContext.Translate<LoginUserMiscInfo>(reader)
                                               select n).FirstOrDefault();
                //The following if statement is written by Pradeep on 1 Aug 2013 to execute rest of code only when LoginUserValidateObject is not null
                //Again committed
                if (LoginUserValidateObject != null)
                {
                    //User
                    reader.NextResult();
                    var UserObject = (from n in ((IObjectContextAdapter)_unitOfWork.SiteInfoContext)
                         .ObjectContext.Translate<User>(reader)
                                      select n).FirstOrDefault();
                    //FBUser
                    reader.NextResult();
                    var FBUserObject = (from n in ((IObjectContextAdapter)_unitOfWork.SiteInfoContext)
                            .ObjectContext.Translate<FBUser>(reader)
                                        select n).FirstOrDefault();
                    //UserAccount
                    reader.NextResult();
                    var UserAccountObject = (from n in ((IObjectContextAdapter)_unitOfWork.SiteInfoContext)
                               .ObjectContext.Translate<UserAccount>(reader)
                                             select n).FirstOrDefault();

                    _ValidateUserLoginModel.LoginUserMiscInfo = LoginUserValidateObject;
                    _ValidateUserLoginModel.User = _sharedInfo.ConvertUserToUserModel(UserObject);
                    _ValidateUserLoginModel.FBUser = FBUserObject;
                    _ValidateUserLoginModel.UserAccount = _sharedInfo.ConvertUserAccountToUserAccountModel(UserAccountObject);
                }
            }
            finally
            {
                _unitOfWork.SiteInfoContext.Database.Connection.Close();
                _unitOfWork.SiteInfoContext.Database.Connection.Dispose();
            }
            return _ValidateUserLoginModel;
        }

       

    }
}
