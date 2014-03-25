using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Na.Core.Cookies;
using Na.Core.Helpers;
using Na.Services.Browse;
using Na.Services.Directory;
using Na.Website.Areas.Search.Models;
using Na.Website.Framework.Search;
using Na.Website.Models.Browse;
using Na.Website.Models.Common;
using System.IO;
using System.Text.RegularExpressions;
using Na.Services.Publications;
using System.Globalization;
using Na.Services.Search;
using Na.Core.Caching;
using PagedList.Mvc;
using System.Web.Script.Serialization;
using Na.Core.Domain.Browse;
using Na.Website.Framework;
using Na.Services.BrowserResultDetail;
using System.Xml.Linq;
using System.Text;
namespace Na.Website.Controllers
{
    //[ValidateAntiForgeryTokenWrapper(HttpVerbs.Post)]
    [HandleException]

    [OutputCache(NoStore = true, Duration = 0, VaryByParam = "*")]//Added by Vishal Tyagi not to store cache
    public class BrowseController : BaseController
    {
        #region Fields
        private readonly IWebLocationPubTitlesService _weblocationpubtitlesService;
        private readonly ICountryService _countryService;
        private readonly IDateService _dateService;
        Na.Core.Configuration.NAConfiguration _config = new Na.Core.Configuration.NAConfiguration();
        private readonly IBrowseDataService _BrowseDataService;
        private readonly IclsCookies _clsCookie;
        private readonly IContextDataHandler _common;
        private readonly IPublicationService _PublicationServices;
        private readonly IRecentSavedSearchService _savedSearchService;
        private readonly IBrowserResultDetailService _browserResultDetail;
        Stopwatch stopWatch = new Stopwatch();
        //Added below line by Vishal Tyagi
        private readonly ICacheManager _cacheManager;
        #endregion

        #region Global Variables declared
        public string _countryId { get; set; }
        public string _stateId { get; set; }
        public string _cityId { get; set; }
        public string _pubId { get; set; }

        public string _countryAbbr { get; set; }
        public string _stateName { get; set; }
        public string _cityName { get; set; }
        public string _titleInitial { get; set; }
        public string _titleName { get; set; }
        public string _countryName { get; set; }

        public string _pubyear { get; set; }
        public string _pubTitleUrl { get; set; }

        public string _startyear { get; set; }
        public string _startmonth { get; set; }
        public string _startday { get; set; }
        public string _endyear { get; set; }
        public string _endmonth { get; set; }
        public string _endday { get; set; }

        public string _MaxPubYearForHeader { get; set; } // Added BY Rakesh  on 04 Sept 2013 
        public string _MinPubYearForHeader { get; set; }

        #endregion

        #region Ctor
        public BrowseController(
          IWebLocationPubTitlesService weblocationpubtitlesService,
          ICountryService countryService,
          IDateService dateService,
          IBrowseDataService browseDataService,
          IclsCookies clsCookie,
          IContextDataHandler common,
          IPublicationService PublicationService,
          IRecentSavedSearchService savedSearchService,
          IBrowserResultDetailService browserResultDetail,
          ICacheManager cacheManager)
        {
            this._weblocationpubtitlesService = weblocationpubtitlesService;
            this._countryService = countryService;
            this._browserResultDetail = browserResultDetail;
            this._dateService = dateService;
            this._BrowseDataService = browseDataService;
            this._clsCookie = clsCookie;
            this._common = common;
            this._PublicationServices = PublicationService;
            this._savedSearchService = savedSearchService;
            //Added below line by Vishal Tyagi
            this._cacheManager = cacheManager;
        }
        #endregion

        #region ActionResult
        public ActionResult Index()
        {

            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();
            model.resultDetails = new System.Collections.Generic.List<Na.Website.Models.Browse.BrowseResultsDetailsModel>();
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }
            fcnClearCookie();
            #region Date Section
            var _DateHelper = new DatesHelper(_cacheManager);
            Dates[] enums = { Dates.AvailableStartYears, Dates.AvailableStartMonths, Dates.AvailableStartDays, Dates.AvailableEndMonths, Dates.AvailableEndDays };
            _DateHelper.SetDates(model.Dates, _dateService, enums);
            #endregion

            return View(model);
        }

        public ActionResult BrowseLocations(int? page)
        {
            ////Response.Write(Request.Url.AbsoluteUri);
            ////Response.End();
            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;

            TempData["RequestURLForRedirect"] = "BrowseLocations"; // added BY Rakesh/DS on 11 nov 2013 w r t task 295
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            if (url.ToLower().IndexOf("page") > 0)
            {
                url = url.Substring(0, url.IndexOf("?"));
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();
            // model.resultDetails = new System.Collections.Generic.List<Na.Website.Models.Browse.BrowseResultsDetailsModel>();
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }
            string _browseRedrect = string.Empty;
            var _browseLocation = string.Empty;
            #region Checking browseLocation page with old type link
            _browseRedrect = fcnOldBrowsetoNewBrowseLink("location");
            if (!String.IsNullOrWhiteSpace(_browseRedrect)) { return RedirectPermanent(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _browseRedrect); }
            #endregion

            //****** Initial Browse Results Populate ************
            GetBrowseResults(ref model, "location");
            GetBrowserLocationBreadcrumbButton(ref model);

            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;
            return View(model);
        }

        public ActionResult BrowseLocations2(int? page)
        {

            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            TempData["RequestURLForRedirect"] = "BrowseLocations"; // added BY Rakesh/DS on 11 nov 2013 w r t task 295
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            if (url.ToLower().IndexOf("page") > 0)
            {
                url = url.Substring(url.IndexOf("?"));
                Response.Write(url);
                Response.End();
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();
            model.resultDetails = new System.Collections.Generic.List<Na.Website.Models.Browse.BrowseResultsDetailsModel>();
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }
            //Response.Write("_stateId=" + Request.Url.AbsoluteUri);
            //Response.End();
            string _browseRedrect = string.Empty;
            var _browseLocation = string.Empty;
            #region Checking browseLocation page with old type link
            _browseRedrect = fcnOldBrowsetoNewBrowseLink("location");
            if (!String.IsNullOrWhiteSpace(_browseRedrect)) { return RedirectPermanent(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _browseRedrect); }
            #endregion

            //****** Initial Browse Results Populate ************
            FetchBrowseResults(model, page, "location");
            //Code Added by Mamta Gupta/D to resolve tfs Issue related to Narrow by Publication Location Country,state,city on 28 October,2013
            //Start

            ViewBag.Country = model.Location.CountryID;
            ViewBag.State = model.Location.StateID;
            ViewBag.City = model.Location.CityID;
            ViewBag.Publication = model.Location.PublicationTitleID;
            //End


            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;

            //************ This is for ajux pagination *********************
            _browseLocation = "BrowseLocations";
            _countryAbbr = _common.GetStringValue(model.Location.CountryAbbr, "");
            _stateName = _common.GetStringValue(model.Location.StateName, "");
            _cityName = _common.GetStringValue(model.Location.CityName, "");

            // Below added By Rakesh on 02 Sept 2013
            ////Commenting below as code is moved in to function FetchBrowseResults line no 740  to get main/max amoung all the records
            //String MaxPubdateYear = model.results.Select(x => x.MaxPubdateYear).Max();
            // String MinPubdateYear = model.results.Select(x => x.MinPubdateYear).Min();
            String FinalHeaderCaption = "", FinalSubHeaderCaption = "", HederCountryName = "", HederStateName = "", HedercityName = "";

            if (!String.IsNullOrWhiteSpace(_countryAbbr))
            {
                _browseLocation = _countryAbbr;
                if (model.results != null && model.results.Count > 0)
                {
                    HederCountryName = model.results[0].countryname;
                }
            }

            if (!String.IsNullOrWhiteSpace(_stateName)) { _browseLocation += "/" + _stateName; HederStateName = _stateName; }
            if (!String.IsNullOrWhiteSpace(_cityName)) { _browseLocation += "/" + _cityName; HedercityName = _cityName; }
            model.MyControlAction = "/" + _browseLocation.Replace(" ", "-").ToLower();

            #region SEO Page Title
            //if (!String.IsNullOrWhiteSpace(_countryAbbr)) { HederCountryName = _countryAbbr + ", "; }
            //if (!String.IsNullOrWhiteSpace(_stateName)) { HederStateName = _stateName+" "; }
            //if (!String.IsNullOrWhiteSpace(_cityName)) { HedercityName = _cityName + ", "; }
            if (HederCountryName != "" && HederStateName == "" && HedercityName == "")
            {
                FinalHeaderCaption = HederCountryName + ":";
                FinalSubHeaderCaption = HederCountryName;
                //Added for Seo title by Kanchan on 10'th September 2013
                model.forSeoTitle = HederCountryName + " Newspaper Archives | Discover Newspapers (" + _MinPubYearForHeader + " - " + _MaxPubYearForHeader‎ + ")";
                //Added for Seo title by Kanchan on 10'th September 2013
            }
            if (HederCountryName != "" && HederStateName != "" && HedercityName == "")
            {
                //FinalHeaderCaption = HederStateName + ":"; /*====Commented by debasis 16/09/2013 for remove colon=====*/
                FinalHeaderCaption = HederStateName;
                FinalSubHeaderCaption = HederStateName;
                //Added for Seo title by Kanchan on 10'th September 2013
                model.forSeoTitle = HederStateName + " Newspaper Archives | Discover Newspapers (" + _MinPubYearForHeader + " - " + _MaxPubYearForHeader‎ + ")";
                //Added for Seo title by Kanchan on 10'th September 2013
            }
            if (HederCountryName != "" && HederStateName != "" && HedercityName != "")
            {
                //FinalHeaderCaption = HedercityName + ", " + HederStateName + ":"; /*====Commented by debasis 16/09/2013 for remove colon=====*/
                FinalHeaderCaption = HedercityName + ", " + HederStateName;
                FinalSubHeaderCaption = HedercityName;
                //Added for Seo title by Kanchan on 10'th September 2013
                model.forSeoTitle = HedercityName + " Newspaper Archives | Discover Newspapers (" + _MinPubYearForHeader + " - " + _MaxPubYearForHeader‎ + ")";
                //Added for Seo title by Kanchan on 10'th September 2013
            }
            if (string.IsNullOrEmpty(_MinPubYearForHeader) && string.IsNullOrEmpty(_MaxPubYearForHeader‎))
            {
                //FinalHeaderCaption = HederStateName + ":"; /*====Commented by debasis 16/09/2013 for remove colon=====*/
                FinalHeaderCaption = HederStateName;
                FinalSubHeaderCaption = HederStateName;
                //Added for Seo title by Kanchan on 10'th September 2013
                model.forSeoTitle = "Newspaper Archives | Discover Newspapers";
                //Added for Seo title by Kanchan on 10'th September 2013
                model.HeaderCaptionText = "Newspaper Archives";
            }
            else
            {
                model.HeaderCaptionText = FinalHeaderCaption + " Newspaper Archives (" + _MinPubYearForHeader + " - " + _MaxPubYearForHeader + ")";
            }
            #endregion

            //model.HeaderCaptionText = FinalHeaderCaption + " Newspaper Archives (" + _MinPubYearForHeader + " - " + _MaxPubYearForHeader + ")";
            model.HeaderSubCaptionText = FinalSubHeaderCaption;
            GetMetaDataForFacebook(ref model);
            //End of code written By Rakesh
            return Request.IsAjaxRequest()
                ? (ActionResult)PartialView("_BrowseListsPartial", model)
                : View(model);
        }

        public ActionResult BrowsePublication(int? page)
        {
            ////Response.Write(Request.Url);
            ////Response.End();
            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            if (url.ToLower().IndexOf("page") > 0)
            {
                url = url.Substring(0, url.IndexOf("?"));
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            var model = new BrowseResultsModel();

            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            #region BrowsePublications With PubYear

            #endregion


            GetBrowseResults(ref model, "publication");
            GetBrowserLocationBreadcrumbButton(ref model);
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse";
            return View(model);
        }

        public ActionResult BrowseArticles(int? page)
        {
            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();
            model.resultDetails = new System.Collections.Generic.List<Na.Website.Models.Browse.BrowseResultsDetailsModel>();
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            _titleInitial = _common.GetQueryStringValue("a", "");
            #region 301 Redirect Old BrowseArticles(BrowseArticles/D.html) to New BrowseArticles(BrowseArticles/D)
            if (!String.IsNullOrWhiteSpace(_titleInitial))
            {
                if (_titleInitial.Contains("html"))
                {
                    _titleInitial = _titleInitial.Replace(".html", "");
                    if (!String.IsNullOrWhiteSpace(_titleInitial)) { return RedirectPermanent(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/BrowseArticles/" + _titleInitial); }
                }
            }
            #endregion

            //****** Initial Browse Results Populate ************
            FetchBrowseResults(model, page, "article");
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;
            var _browseArticles = "BrowseArticles";
            if (!String.IsNullOrWhiteSpace(_titleInitial))
            {
                ////int index = _titleInitial.LastIndexOf("-(");
                ////if (index > 0) { _titleInitial = _titleInitial.Substring(0, index); }
                ////Response.Write(_titleInitial);

                _browseArticles += "/" + _titleInitial.Replace("/", "");
            }
            model.MyControlAction = "/" + _browseArticles;

            return Request.IsAjaxRequest()
                ? (ActionResult)PartialView("_BrowseListsPartial", model)
                : View(model);
        }

        public ActionResult BrowseDate(int? page)
        {
            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            if (Request.QueryString["yr"] != null)
            {
                var year = _common.GetStringValue(Request.QueryString["yr"], "").Replace("/", "");
                if (year.Length > 3)
                {
                    string first2digit = year.Substring(0, 2);
                    if (!string.IsNullOrEmpty(first2digit))
                    {
                        url = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/historical-events/" + first2digit + "00s/" + year;
                        Response.Status = "301 Moved Permanently";
                        Response.AddHeader("Location", url + "/");
                    }
                }
            }
            TempData["RequestURLForRedirect"] = "BrowseDate";  // added BY Rakesh/DS on 11 nov 2013 w r t task 295  
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }
            #endregion

            var model = new BrowseResultsModel();
            model.resultDetails = new System.Collections.Generic.List<Na.Website.Models.Browse.BrowseResultsDetailsModel>();
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            string _browseRedrect = string.Empty;
            #region Checking BrowseDate page with old type link
            _browseRedrect = fcnOldBrowsetoNewBrowseLink("date");
            if (!String.IsNullOrWhiteSpace(_browseRedrect)) { return RedirectPermanent(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _browseRedrect); }
            #endregion
            //****** Initial Browse Results Populate ************
            FetchBrowseResults(model, page, "date");

            //******* Set for pagination *******************
            var _browseDate = Request.RawUrl;
            if (_browseDate.Contains("?")) { var _rawUrl = _browseDate.Split('?'); if (_rawUrl != null) { _browseDate = _rawUrl[0]; } }
            model.MyControlAction = _browseDate;
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;

            return Request.IsAjaxRequest()
                ? (ActionResult)PartialView("_BrowseListsPartial", model)
                : View(model);
        }

        public ActionResult BrowseLocationsV1(int? page)
        {
            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;

            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();

            #region Country Load
            //var strCountryContent = string.Empty;
            //var resultCountrydetails = _weblocationpubtitlesService.GetAllCountries();  // _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(_contryId, 0));
            //if (resultCountrydetails != null && resultCountrydetails.Count > 0)
            //{
            //    strCountryContent += "<ul>";
            //    var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
            //    foreach (var item in resultCountrydetails)
            //    {
            //        strCountryContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.countryid, _guid) + "\" class=\"browseByCountry\">" + _common.GetStringValue(item.countryName, string.Empty) + "</a></li>";
            //    }
            //    strCountryContent += "</ul>";
            //    strCountryContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
            //    model.CountryContent = strCountryContent;
            //    model.CountryCount = _common.GetStringValue(resultCountrydetails.Count, string.Empty);
            //}
            #endregion

            #region State Load
            model.hdnPageLoad = "1";
            var _countryId = 7;
            model.hdnCountryId = "7";
            var strContent = string.Empty;
            //var resultdetails = _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(_contryId, 0));
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), 0, 0, 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.StateId, _guid) + "\" class=\"browseByState\" onclick=javascript:fcnGetCity(" + _common.GetStringValue(item.StateId, "0") + ");>" + _common.GetStringValue(item.StateName, string.Empty) + " (" + _common.GetStringValue(item.StateCount, "0") + ")" + "</a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                model.StateContent = strContent;
                model.StateCount = _common.GetStringValue(resultdetails.Count, string.Empty);
            }
            #endregion

            return View(model);
        }
        public ActionResult BrowsePapers(int? page)
        {
            #region Code to redirect with a slash by Raju @ 30th Sept, 2013

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion

            var model = new BrowseResultsModel();

            #region Country Load
            //var strCountryContent = string.Empty;
            //var resultCountrydetails = _weblocationpubtitlesService.GetAllCountries();  // _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(_contryId, 0));
            //if (resultCountrydetails != null && resultCountrydetails.Count > 0)
            //{
            //    strCountryContent += "<ul>";
            //    var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
            //    foreach (var item in resultCountrydetails)
            //    {
            //        strCountryContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.countryid, _guid) + "\" class=\"browseByCountry\">" + _common.GetStringValue(item.countryName, string.Empty) + "</a></li>";
            //    }
            //    strCountryContent += "</ul>";
            //    strCountryContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
            //    model.CountryContent = strCountryContent;
            //    model.CountryCount = _common.GetStringValue(resultCountrydetails.Count, string.Empty);
            //}
            #endregion

            #region State Load
            model.hdnPageLoad = "1";
            var _countryId = 7;
            model.hdnCountryId = "7";
            var strContent = string.Empty;
            //var resultdetails = _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(_contryId, 0));
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), 0, 0, 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.StateId, _guid) + "\" class=\"browseByState\" onclick=javascript:fcnGetCity(" + _common.GetStringValue(item.StateId, "0") + ");>" + _common.GetStringValue(item.StateName, string.Empty) + " (" + _common.GetStringValue(item.StateCount, "0") + ")" + "</a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                model.StateContent = strContent;
                model.StateCount = _common.GetStringValue(resultdetails.Count, string.Empty);
            }
            #endregion

            return View(model);
        }
        public ActionResult BrowseOtherCountries()
        {
            #region Code to redirect with a slash

            var url = Na.Core.Configuration.NaConfig.Url.DomainUrl + Request.RawUrl;

            TempData["RequestURLForRedirect"] = "BrowseLocations";
            if (!Request.IsAjaxRequest() && CheckUrlForRediract(url))
            {
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            if (url.ToLower().IndexOf("page") > 0)
            {
                url = url.Substring(0, url.IndexOf("?"));
                Response.Status = "301 Moved Permanently";
                Response.AddHeader("Location", url + "/");
            }

            #endregion
            return View();
        }

        #region For SEO Viewer
        // [OutputCache(Duration = 1, VaryByParam = "*")]
        public ActionResult BrowseAvailablePapers()
        {
            //Response.Write(Request.Url);
            // Response.End();
            var model = new BrowseResultsModel();

            #region State Load
            model.hdnPageLoad = "1";
            var _countryId = 7;
            model.hdnCountryId = "7";
            var strContent = string.Empty;
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), 0, 0, 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.StateId, _guid) + "\" class=\"browseByState\" onclick=javascript:fcnGetCity(" + _common.GetStringValue(item.StateId, "0") + ");>" + _common.GetStringValue(item.StateName, string.Empty) + " (" + _common.GetStringValue(item.StateCount, "0") + ")" + "</a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                model.StateContent = strContent;
                model.StateCount = _common.GetStringValue(resultdetails.Count, string.Empty);
            }
            #endregion

            return View(model);
        }
        public ActionResult BrowseMapsSEOViewer()
        {
            return View();
        }
        #endregion

        #endregion

        #region HttpPost ActionResult
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Index(string btnsubmit, BrowseResultsModel model)
        {
            #region Click on Clear Button(Clear Cookie and set to as fresh BrowseLocation Data)
            if (!String.IsNullOrWhiteSpace(btnsubmit) && btnsubmit.Trim() == "Clear")
            {
                fcnClearCookie();
                return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse");
            }
            #endregion

            #region Click on Search Button
            var _url = string.Empty;
            _url = BrowseByMapPost(model);
            if (!String.IsNullOrWhiteSpace(_url)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _url); }
            #endregion

            return View(model);
        }

        [ValidateInput(false)]
        [HttpPost]
        public ActionResult BrowseLocations(string btnsubmit, BrowseResultsModel model, int? page)
        {
            #region Click on Clear Button(Clear Cookie and set to as fresh BrowseLocation Data)
            if (!String.IsNullOrWhiteSpace(btnsubmit) && btnsubmit.Trim() == "Clear")
            {
                fcnClearCookie();
                return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browselocations");
            }
            #endregion

            #region Click on Search Button
            var _url = string.Empty;
            _url = BrowsePagePost(model, "location");
            if (!String.IsNullOrWhiteSpace(_url)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _url); }
            #endregion

            return View(model);
        }

        [ValidateInput(false)]
        [HttpPost]
        public ActionResult BrowseArticles(string btnsubmit, BrowseResultsModel model, int? page)
        {
            #region Click on Clear Button(Clear Cookie and set to as fresh BrowseArticles Data)
            if (!String.IsNullOrWhiteSpace(btnsubmit) && btnsubmit.Trim() == "Clear")
            {
                fcnClearCookie();
                return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/BrowseArticles");
            }
            #endregion

            #region Click on Search Button
            var _url = string.Empty;
            _url = BrowsePagePost(model, "article");
            if (!String.IsNullOrWhiteSpace(_url)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _url); }
            #endregion

            return View(model);
        }

        [ValidateInput(false)]
        [HttpPost]
        public ActionResult BrowseDate(string btnsubmit, BrowseResultsModel model, int? page)
        {
            #region Click on Clear Button(Clear Cookie and set to as fresh BrowseDate Data)
            if (!String.IsNullOrWhiteSpace(btnsubmit) && btnsubmit.Trim() == "Clear")
            {
                fcnClearCookie();
                return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/BrowseDate");
            }
            #endregion

            #region Click on Search Button
            var _url = string.Empty;
            _url = BrowsePagePost(model, "date");
            if (!String.IsNullOrWhiteSpace(_url)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _url); }
            #endregion

            return View(model);
        }

        [ValidateInput(false)]
        [HttpPost]
        public ActionResult BrowseLocationsV1(BrowseResultsModel model, int? page)
        {
            #region Search Filter Create
            model.AllOfTheWordsString = !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Keyword, string.Empty)) ? _common.GetStringValue(model.Keyword, string.Empty) : string.Empty;
            model.Location.CountryID = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnCountryId, string.Empty)) && _common.GetStringValue(model.hdnCountryId, string.Empty) != "0") ? _common.GetStringValue(model.hdnCountryId, string.Empty) : string.Empty;
            model.Location.StateID = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnStateId, string.Empty)) && _common.GetStringValue(model.hdnStateId, string.Empty) != "0") ? _common.GetStringValue(model.hdnStateId, string.Empty) : string.Empty;
            model.Location.CityID = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnCityId, string.Empty)) && _common.GetStringValue(model.hdnCityId, string.Empty) != "0") ? _common.GetStringValue(model.hdnCityId, string.Empty) : string.Empty;
            model.Location.PublicationTitleID = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnPubId, string.Empty)) && _common.GetStringValue(model.hdnPubId, string.Empty) != "0") ? _common.GetStringValue(model.hdnPubId, string.Empty) : string.Empty;
            model.Location.IsPublicationLocation = !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Location.CountryID, string.Empty)) ? true : false;

            model.Dates.StartYear = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnPubYear, string.Empty)) && _common.GetStringValue(model.hdnPubYear, string.Empty) != "0") ? _common.GetStringValue(model.hdnPubYear, string.Empty) : string.Empty;
            model.Dates.StartMonth = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnPubMonth, string.Empty)) && _common.GetStringValue(model.hdnPubMonth, string.Empty) != "0") ? _common.GetStringValue(model.hdnPubMonth, string.Empty) : string.Empty;
            model.Dates.StartDay = (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.hdnPubDay, string.Empty)) && _common.GetStringValue(model.hdnPubDay, string.Empty) != "0") ? _common.GetStringValue(model.hdnPubDay, string.Empty) : string.Empty;
            model.Dates.IsPublicationDate = !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.StartYear, string.Empty)) ? true : false;
            #endregion

            var _url = string.Empty;
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            //If there are any valid search term then first priority to search otherwise browse with filters
            _url = SearchModelObj(model);
            if (!String.IsNullOrWhiteSpace(_url)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + _url); }
            return View(model);
        }

        [HttpParamAction]
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Search(BrowseResultsModel model)
        {

            #region Click on Search Button
            var _url = string.Empty;
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse";

            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            SearchModelObj(ref  model);

            if (String.IsNullOrWhiteSpace(model.ReturnUrl))
            {
                SetBrowseCookiePost(model);
                fncBrowseRedirect(ref model, "location");
            }

            if (!String.IsNullOrWhiteSpace(model.ReturnUrl)) { return Redirect(Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.ReturnUrl); }

            #endregion

            return View(model);
        }
        #endregion

        #region HttpAjaxGet
        public JsonResult AjaxGetBrowseResultsByCountry()
        {
            var _countryId = _common.GetQueryStringValue("countryid", string.Empty);
            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            // var resultdetails = _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(_countryId, 0));
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), 0, 0, 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"s" + _common.GetStringValue(item.StateId, _guid) + "\" class=\"browseByState\" onclick=javascript:fcnGetCity(" + _common.GetStringValue(item.StateId, "0") + ");>" + _common.GetStringValue(item.StateName, string.Empty) + " (" + _common.GetStringValue(item.StateCount, "0") + ") </a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", _common.GetStringValue(strContent, string.Empty));
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowseResultsByState()
        {
            var _countryId = _common.GetQueryStringValue("countryid", string.Empty);
            var _stateId = _common.GetQueryStringValue("stateid", string.Empty);
            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            ////var resultdetails = _weblocationpubtitlesService.GetCitiesByStateId(_common.GetIntegerValue(_stateId, 0));
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), _common.GetIntegerValue(_stateId, 0), 0, 2);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"city" + _common.GetStringValue(item.CityId, _guid) + "\" class=\"browseByCity\" onclick=javascript:fcnGetPubs(" + _common.GetStringValue(item.CityId, "0") + ");>" + _common.GetStringValue(item.CityName, string.Empty) + " (" + _common.GetStringValue(item.CityCount, "0") + ") </a></li>";
                }
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowseResultsByCity()
        {
            var _countryId = _common.GetQueryStringValue("countryid", string.Empty);
            var _stateId = _common.GetQueryStringValue("stateid", string.Empty);
            var _cityid = _common.GetQueryStringValue("cityid", string.Empty);
            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            //var resultdetails = _weblocationpubtitlesService.GetTitlesWithYearByCityId(_common.GetIntegerValue(_cityid, 0));
            var resultdetails = _BrowseDataService.getBrowsePubCountsByPubId(_common.GetIntegerValue(_countryId, 0), _common.GetIntegerValue(_stateId, 0), _common.GetIntegerValue(_cityid, 0), 3);
            if (resultdetails != null) // && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"pubid" + _common.GetStringValue(item.PubId, _guid) + "\" class=\"browseByPubId\" onclick=javascript:fcnGetPubYears(" + _common.GetStringValue(item.PubId, "0") + ");>" + _common.GetStringValue(item.PubTitle, string.Empty) + " (" + _common.GetStringValue(item.PubCount, "0") + ") </a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowseYearsByPubId()
        {
            var _pubid = _common.GetQueryStringValue("pubid", string.Empty);
            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            var resultdetails = _BrowseDataService.getBrowsePubYearsByPubId(_common.GetIntegerValue(_pubid, 0), 0, 0, 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"pubYear" + _common.GetStringValue(item.PubDateYear, _guid) + "\" class=\"browseByPubYear\" onclick=javascript:fcnGetPubMonth(" + _pubid + "," + _common.GetStringValue(item.PubDateYear, "0") + ");>" + _common.GetStringValue(item.PubDateYear, string.Empty) + " (" + _common.GetStringValue(item.PubMonthCount, "0") + ") </a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowsePubMonthsByYear()
        {
            var _pubid = _common.GetQueryStringValue("pubid", string.Empty);
            var _PubDateYear = _common.GetQueryStringValue("PubDateYear", string.Empty);
            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            var resultdetails = _BrowseDataService.getBrowsePubYearsByPubId(_common.GetIntegerValue(_pubid, 0), _common.GetIntegerValue(_PubDateYear, 0), 0, 2);
            if (resultdetails != null) // && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"pubMonth" + _common.GetStringValue(item.PubDateMonth, _guid) + "\" class=\"browseByPubMonth\" onclick=javascript:fcnGetPubDay(" + _pubid + "," + _PubDateYear + "," + _common.GetStringValue(item.PubDateMonth, "0") + ");>" + GetMonthName(_common.GetIntegerValue(item.PubDateMonth, 0)) + " (" + _common.GetStringValue(item.PubDayCount, "0") + ") </a></li>";
                }
                strContent += "</ul>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowsePubDaysByMonth()
        {
            var _pubid = _common.GetQueryStringValue("pubid", string.Empty);
            var _PubDateYear = _common.GetQueryStringValue("PubDateYear", string.Empty);
            var _PubDateMonth = _common.GetQueryStringValue("PubDateMonth", string.Empty);

            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            //******** Fetch all States By CountryId *******************************
            var resultdetails = _BrowseDataService.getBrowsePubYearsByPubId(_common.GetIntegerValue(_pubid, 0), _common.GetIntegerValue(_PubDateYear, 0), _common.GetIntegerValue(_PubDateMonth, 0), 3);
            if (resultdetails != null) // && resultdetails.Count > 0)
            {
                strContent += "<ul>";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                foreach (var item in resultdetails)
                {
                    strContent += "<li><a href=\"javascript:void(0);\" id=\"PubDay" + _common.GetStringValue(item.PubDateDay, _guid) + "\" class=\"browseByPubDay\" onclick=javascript:fcnGetPubImage(" + _pubid + "," + _PubDateYear + "," + _PubDateMonth + "," + _common.GetStringValue(item.PubDateDay, "0") + ");>" + _common.GetStringValue(item.PubDateDay, string.Empty) + " " + GetMonthName(_common.GetIntegerValue(_PubDateMonth, 0)) + " " + _common.GetStringValue(_PubDateYear, string.Empty) + " (" + _common.GetStringValue(item.ImageCount, "0") + ") </a></li>";
                }
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowsePubImages()
        {
            var _pubid = _common.GetQueryStringValue("pubid", string.Empty);
            var _PubDateYear = _common.GetQueryStringValue("PubDateYear", string.Empty);
            var _PubDateMonth = _common.GetQueryStringValue("PubDateMonth", string.Empty);
            var _PubDateDay = _common.GetQueryStringValue("PubDateDay", string.Empty);
            var _pubDate = !String.IsNullOrWhiteSpace(_PubDateYear) ? _PubDateYear : string.Empty;
            _pubDate += "-" + ((!String.IsNullOrWhiteSpace(_PubDateYear) && !String.IsNullOrWhiteSpace(_PubDateMonth)) ? DropDownDatesFormat(_PubDateMonth) : string.Empty);
            _pubDate += "-" + ((!String.IsNullOrWhiteSpace(_PubDateYear) && !String.IsNullOrWhiteSpace(_PubDateMonth) && !String.IsNullOrWhiteSpace(_PubDateMonth)) ? DropDownDatesFormat(_PubDateDay) : string.Empty);

            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            var _domainUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl;
            //******** Fetch all States By CountryId *******************************
            var resultdetails = _PublicationServices.GetImageDetailsByPubIdPubDate(_common.GetIntegerValue(_pubid, 0), _pubDate);

            if (resultdetails != null && resultdetails.Count > 0)
            {
                strContent += "<ul class=\"pageThumbList\">";
                var _guid = _common.GetStringValue(Guid.NewGuid(), string.Empty);
                var _image = string.Empty;
                var _title = string.Empty;
                var _loderImg = string.Empty;
                var _page = string.Empty;
                foreach (var item in resultdetails)
                {
                    _image = _domainUrl + "/" + item.seoTitle + "/" + item.pubDate + "/" + item.imageid + "-thumbnail.jpg";
                    _loderImg = _image; // _domainUrl + "/content/images/trans.gif";
                    _title = item.pubTitle + " from " + item.countryName + "," + item.stateName + "," + item.cityName + " for " + _common.GetDateTimeValue(item.pubDate).ToString("D", CultureInfo.CreateSpecificCulture("en-US"));
                    _page = item.pageNumber > 1 ? "/page-" + item.pageNumber : string.Empty;
                    strContent += "<li>";
                    strContent += "<a target=\"_parent\" href=\"" + _domainUrl + "/" + item.seoTitle + "/" + item.pubDate + _page + "\" id=\"page-" + item.pageNumber + "\">";
                    strContent += "<img class=\"lazyimage\" alt=\"\" width=\"70\" height=\"96\" src=\"" + _loderImg + "\"";
                    strContent += " data-original=\"" + _image + "\" alt=\"" + _title + "\" title=\"" + _title + "\" /></a>";
                    strContent += "<span>";
                    strContent += "<a href=\"javascript:void(0);\">Page " + item.pageNumber + "</a>";
                    strContent += "<a href=\"javascript:callImageDescription('" + item.pubid + "', '" + item.pubDate + "', '" + item.pageNumber + "');\" class=\"info\"><!-- --></a>";
                    strContent += "</span>";
                    strContent += "</li>";
                }
                strContent += "</ul>";
                strContent += "<div id=\"divPubImageInfo\"></div>";
                strContent += "</div>";
                strContent += "<script type='text/javascript'>adjustVerticalScroll();</script>";
                _list.Add("htmlContent", strContent);
                _list.Add("SelectCount", _common.GetStringValue(resultdetails.Count, "0"));
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }

        public JsonResult AjaxGetBrowsePubImagesContent()
        {
            var _pubid = _common.GetQueryStringValue("pubId", string.Empty);
            var _pubDate = _common.GetQueryStringValue("pubDate", string.Empty);
            var _pageNumber = _common.GetIntegerValue(_common.GetQueryStringValue("pageNum", string.Empty), 1);

            var _list = new Dictionary<string, string>();
            var strContent = string.Empty;
            var _domainUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl;
            //******** Fetch all States By CountryId *******************************
            var resultdetails = _PublicationServices.GetImageDetailsByPubIdPubDate(_common.GetIntegerValue(_pubid, 0), _pubDate);

            if (resultdetails != null && resultdetails.Count > 0)
            {
                var _currentElement = resultdetails.Find(c => c.pageNumber == _pageNumber);
                if (_currentElement != null)
                {
                    var pdfContent = GetPdfContent(_currentElement.imageid, _currentElement.imagepath);
                    if (!String.IsNullOrWhiteSpace(pdfContent) && pdfContent.Length > 350) { pdfContent = pdfContent.Substring(0, 350); }
                    var _image = string.Empty;
                    var _title = string.Empty;
                    var _loderImg = string.Empty;
                    _image = _domainUrl + "/" + _currentElement.seoTitle + "/" + _currentElement.pubDate + "/" + _currentElement.imageid + "-thumbnail.jpg";
                    _loderImg = _image; // _domainUrl + "/content/images/trans.gif";
                    _title = _currentElement.pubTitle + " from " + _currentElement.countryName + "," + _currentElement.stateName + "," + _currentElement.cityName + " for " + _common.GetDateTimeValue(_currentElement.pubDate).ToString("D", CultureInfo.CreateSpecificCulture("en-US"));
                    var _page = _pageNumber > 1 ? "/page-" + _pageNumber : string.Empty;

                    strContent += "<div style=\"display:block;\" class=\"pageDetailsBlock\">";
                    strContent += "<div class=\"pageDetailsBar\">";
                    strContent += "<h5>Page " + _currentElement.pageNumber + "</h5>";
                    strContent += "<div class=\"btn-group pull-right\">";
                    strContent += "<a href=\"javascript:callImageDescription('" + _currentElement.pubid + "', '" + _currentElement.pubDate + "', '" + (_pageNumber - 1) + "');\" class=\"btn\" id=\"leftArrowBtn\"><i class=\"icon-step-backward\"></i></a>";
                    strContent += "<a href=\"javascript:callImageDescription('" + _currentElement.pubid + "', '" + _currentElement.pubDate + "', '" + (_pageNumber + 1) + "');\" class=\"btn\" id=\"rightArrowBtn\"><i class=\"icon-step-forward\"></i></a>";
                    strContent += "</div>";
                    strContent += "<div class=\"pull-right pageToggleBtn\">";
                    strContent += "<a href=\"javascript:fcnGridView();\" class=\"btn\"><i class=\"icon-th\"></i></a>";
                    strContent += "</div>";
                    strContent += "</div>";
                    strContent += "<div class=\"pageDetailsArea\">";
                    strContent += "<a target=\"_parent\" href=\"" + _domainUrl + "/" + _common.GetStringValue(_currentElement.seoTitle, string.Empty) + "/" + _common.GetStringValue(_currentElement.pubDate, string.Empty) + _page + "\">";
                    strContent += "<img height=\"163\" width=\"130\" alt=\"\" src=\"" + _image + "\"></a>";
                    strContent += "<div class=\"pageDetailsBlockArea\">";
                    strContent += "<h6>";
                    strContent += "<a target=\"_parent\" href=\"" + _domainUrl + "/" + _common.GetStringValue(_currentElement.seoTitle, string.Empty) + "/" + _common.GetStringValue(_currentElement.pubDate, string.Empty) + _page + "\">";
                    strContent += _currentElement.pubTitle;
                    strContent += "</a><span>" + String.Format("{0:D}", _common.GetDateTimeValue(_currentElement.pubDate)) + ", " + _currentElement.cityName + ", " + _currentElement.stateName + "</span></h6>";
                    strContent += "<p>" + pdfContent + "</p>";
                    strContent += "</div>";
                    strContent += "<div class=\"clear\"><!-- --></div>";
                    strContent += "</div>";
                    strContent += "</div>";

                    _list.Add("htmlContent", strContent);
                }
            }
            return Json(_list, JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region General Methods
        public void FetchBrowseResults(BrowseResultsModel model, int? page, string pagename)
        {
            //************** Declared Location and Date models *************************
            model.Location = new LocationModels();
            model.Dates = new DateModels();

            //************** Set Default Search Filters ********************************
            ////if (string.IsNullOrWhiteSpace(model.AllOfTheWordsString)) { model.AllOfTheWordsString = "battle Gettysburg Civil War"; }
            ////if (string.IsNullOrWhiteSpace(model.AnyOfTheWordsString)) { model.AnyOfTheWordsString = "soldier infantry"; }
            ////if (string.IsNullOrWhiteSpace(model.ExactPhraseString)) { model.ExactPhraseString = "John Smith buried"; }
            ////if (string.IsNullOrWhiteSpace(model.WithoutWordsString)) { model.WithoutWordsString = "Adams George Henry"; }

            //************* BrowseLocation Cookie Check and Reset ***********************
            SetBrowseCookieGet(model, pagename);

            //************* Location Filters Check from Cookie and Reset ****************
            LocationDropDownPopulate(model);

            //************* Date Filters Check from Cookie and Reset ********************
            DatesDropDownPopulate(model);

            #region Browse Results Populate
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if (hcBrowse != null)
            {
                //******** Set Browse Filters Names ***************
                fcnSetBrowseFilters(model, pagename);
                //stopWatch.Start();
                //var resultdetails = _BrowseDataService.GetBrowseYearRangeResults(_common.GetIntegerValue(hcBrowse.Values["cityid"], 0), _common.GetIntegerValue(hcBrowse.Values["stateid"], 0), _common.GetIntegerValue(hcBrowse.Values["countryid"], 0), _common.GetIntegerValue(hcBrowse.Values["titleid"], 0), _common.GetStringValue(hcBrowse.Values["year"], ""), _common.GetStringValue(hcBrowse.Values["month"], ""), _common.GetStringValue(hcBrowse.Values["day"], ""), _common.GetStringValue(hcBrowse.Values["endyear"], ""), _common.GetStringValue(hcBrowse.Values["endmonth"], ""), _common.GetStringValue(hcBrowse.Values["endday"], ""), _common.GetStringValue(hcBrowse.Values["titleinitial"], ""));
                //stopWatch.Stop();     //takes 2mins:17sec
                //TimeSpan ts = stopWatch.Elapsed;
                //string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
                //ts.Hours, ts.Minutes, ts.Seconds,
                //ts.Milliseconds / 10);
                //System.IO.StreamWriter file = new System.IO.StreamWriter(@"C:\DZT Other Fles\Chandi\timeloaded.txt");
                //file.WriteLine("GetBrowseYearRangeResults: " + elapsedTime);
                //file.Close();
                // List<BrowseResultsDetailsModel> ObjResultModel;
                //Below added By Rakesh on 04 Sept 2013 to show min/max  publicatin date in H1 caption
                //// IList<Na.Core.Domain.Browse.BrowseData> ObjResultModel;
                // ObjResultModel = resultdetails.ToList<Na.Core.Domain.Browse.BrowseData>();
                // _MaxPubYearForHeader = ObjResultModel.Select(x => x.MaxPubdateYear).Max();
                // _MinPubYearForHeader = ObjResultModel.Select(x => x.MinPubdateYear).Min();
                //End of Rakesh's Code 
                FetchResultDetails(model, page);
            }
            #endregion
        }
        /// <summary>
        ///  Written by Mamta Gupta on 12Sept to fetch result in this function using page no and result per page
        /// </summary>
        /// <param name="resultdetails"></param>
        /// <param name="model"></param>
        /// <param name="page"></param>
        public void FetchResultDetails(BrowseResultsModel model, int? page)
        {

            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            var _recordsPerPage = _common.GetIntegerValue(model.hdnRecordsPerPage, 0);
            if (hcBrowse != null && _recordsPerPage == 0) { _recordsPerPage = _common.GetIntegerValue(hcBrowse.Values["resultsperpage"], 0); }

            if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; } else { model.ResultsPageCount = 15; _recordsPerPage = 15; }
            int startIndex = (page ?? 1);
            model.Page = _common.GetIntegerValue(startIndex, 1);
            //var resultdetailsWithPagingData = _BrowseDataService.GetBrowseYearRangeResultsV1(_common.GetIntegerValue(hcBrowse.Values["cityid"], 0), _common.GetIntegerValue(hcBrowse.Values["stateid"], 0), _common.GetIntegerValue(hcBrowse.Values["countryid"], 0), _common.GetIntegerValue(hcBrowse.Values["titleid"], 0), _common.GetStringValue(hcBrowse.Values["year"], ""), _common.GetStringValue(hcBrowse.Values["month"], ""), _common.GetStringValue(hcBrowse.Values["day"], ""), _common.GetStringValue(hcBrowse.Values["endyear"], ""), _common.GetStringValue(hcBrowse.Values["endmonth"], ""), _common.GetStringValue(hcBrowse.Values["endday"], ""), _common.GetStringValue(hcBrowse.Values["titleinitial"], ""), startIndex, _recordsPerPage);
            //*********************  start of caching code by Rakesh on 01 Nov 2013 *****************************
            JavaScriptSerializer serializer = new JavaScriptSerializer();

            string BrowseCachekey = "BrowseData" + hcBrowse.Values["cityid"] + "_" + hcBrowse.Values["stateid"] + "_" + hcBrowse.Values["countryid"] + "_" + hcBrowse.Values["titleid"] + "_" + hcBrowse.Values["year"] + "_" + hcBrowse.Values["month"] + "_" + hcBrowse.Values["day"] + "_" + hcBrowse.Values["endyear"] + "_" + hcBrowse.Values["endmonth"] + "_" + hcBrowse.Values["endday"] + "_" + hcBrowse.Values["titleinitial"] + "_" + page + "_" + _recordsPerPage;
            BrowseDataWithPaging objBrowseData = new BrowseDataWithPaging();
            var resultdetailsWithPagingData = objBrowseData;
            if (this._cacheManager.IsSet(BrowseCachekey) && _cacheManager.Get<string>(BrowseCachekey).Length > 0)
            {
                var resultdetailsWithPagingData1 = _cacheManager.Get<string>(BrowseCachekey);
                object objBrowse = serializer.Deserialize(resultdetailsWithPagingData1.ToString(), typeof(BrowseDataWithPaging));
                resultdetailsWithPagingData = (BrowseDataWithPaging)objBrowse;
            }
            else
            {
                resultdetailsWithPagingData = _BrowseDataService.GetBrowseYearRangeResultsV1(_common.GetIntegerValue(hcBrowse.Values["cityid"], 0), _common.GetIntegerValue(hcBrowse.Values["stateid"], 0), _common.GetIntegerValue(hcBrowse.Values["countryid"], 0), _common.GetIntegerValue(hcBrowse.Values["titleid"], 0), _common.GetStringValue(hcBrowse.Values["year"], ""), _common.GetStringValue(hcBrowse.Values["month"], ""), _common.GetStringValue(hcBrowse.Values["day"], ""), _common.GetStringValue(hcBrowse.Values["endyear"], ""), _common.GetStringValue(hcBrowse.Values["endmonth"], ""), _common.GetStringValue(hcBrowse.Values["endday"], ""), _common.GetStringValue(hcBrowse.Values["titleinitial"], ""), startIndex, _recordsPerPage);
                string BrowseData = serializer.Serialize(resultdetailsWithPagingData);
                _cacheManager.Set(BrowseCachekey, BrowseData, 7200); // added for caching 
            }
            //************************   end  *************************************

            model.TotalBrowseresultCount = 0;
            if (resultdetailsWithPagingData != null)
            {
                var resultdetails = resultdetailsWithPagingData.BrowseData;
                //added by Rakesh on 07 NOv 2013  
                Na.Core.Domain.Browse.BrowseDataPubYears objBrowseDataPubYears = new Na.Core.Domain.Browse.BrowseDataPubYears();
                objBrowseDataPubYears = resultdetailsWithPagingData.BrowseDataPubYearsDetail;

                if (resultdetails != null && resultdetails.Count > 0)
                {


                    //if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; } else { model.ResultsPageCount = 15; }
                    var _resultPerpage = new List<SelectListItem>();
                    _resultPerpage.Add(new SelectListItem { Value = "15", Text = "15", Selected = 15 == _recordsPerPage ? true : false });
                    _resultPerpage.Add(new SelectListItem { Value = "30", Text = "30", Selected = 30 == _recordsPerPage ? true : false });
                    model.ResulsPerPage = _resultPerpage;

                    var result = resultdetails.AsEnumerable();
                    //result = model.results = resultdetails.ToPagedList(startIndex, _common.GetIntegerValue(model.ResultsPageCount, 15)); //resultdetails.Skip(startIndex).Take(RecordsPerPage);
                    result = model.results = resultdetails.ToList();
                    if (resultdetailsWithPagingData.PagingInformation != null)
                    {
                        model.TotalBrowseresultCount = resultdetailsWithPagingData.PagingInformation.PageCount;
                        model.pagingresults = new CustomPagingInformation()
                        {
                            FirstItemOnPage = resultdetailsWithPagingData.PagingInformation.FirstItemOnPage,
                            HasNextPage = resultdetailsWithPagingData.PagingInformation.HasNextPage,
                            HasPreviousPage = resultdetailsWithPagingData.PagingInformation.HasPreviousPage,
                            IsFirstPage = resultdetailsWithPagingData.PagingInformation.IsFirstPage,
                            IsLastPage = resultdetailsWithPagingData.PagingInformation.IsLastPage,
                            LastItemOnPage = resultdetailsWithPagingData.PagingInformation.LastItemOnPage,
                            PageCount = resultdetailsWithPagingData.PagingInformation.PageCount,
                            PageNumber = resultdetailsWithPagingData.PagingInformation.PageNumber,
                            PageSize = resultdetailsWithPagingData.PagingInformation.PageSize,
                            TotalItemCount = resultdetailsWithPagingData.PagingInformation.TotalItemCount
                        };
                    }
                    // _MaxPubYearForHeader = resultdetails.Select(x => x.MaxPubdateYear).Max();
                    //_MinPubYearForHeader = resultdetails.Select(x => x.MinPubdateYear).Min();
                    _MinPubYearForHeader = objBrowseDataPubYears.MinPubdateYearForHeader;
                    _MaxPubYearForHeader = objBrowseDataPubYears.MaxPubdateYearForHeader;


                    foreach (var item in result)
                    {
                        var results = new Na.Website.Models.Browse.BrowseResultsDetailsModel();
                        results.cityid = _common.GetIntegerValue(item.cityid, 0);
                        results.stateid = _common.GetIntegerValue(item.stateid, 0);
                        results.countryid = _common.GetIntegerValue(item.countryid, 0);
                        results.cityName = _common.GetStringValue(item.cityName, "");
                        results.statename = _common.GetStringValue(item.statename, "");
                        results.countryname = _common.GetStringValue(item.countryname, "");
                        results.pubTitle = _common.GetStringValue(item.pubTitle, "");
                        results.formatedPubTitle = _common.GetStringValue(item.pubTitleURL, "");  //ReplaceTHE_RemoveSpecialChar(_common.GetStringValue(item.pubTitle, "").ToLower());
                        results.pubid = _common.GetIntegerValue(item.pubid, 0);
                        results.MaxPubdateYear = _common.GetStringValue(item.MaxPubdateYear, "");
                        results.MinPubdateYear = _common.GetStringValue(item.MinPubdateYear, "");
                        if (results.MaxPubdateYear != "" && (results.MaxPubdateYear == results.MinPubdateYear))
                        {
                            results.PubdateYearRange = results.MaxPubdateYear;
                        }
                        else
                        {
                            results.PubdateYearRange = results.MinPubdateYear + " - " + results.MaxPubdateYear;
                        }
                        results.countryAbbr = _common.GetStringValue(item.CountryUrlText, "").Replace(" ", "");
                        results.formatedStateName = FormatedLocationNames(_common.GetStringValue(item.statename, ""));
                        results.formatedCityName = FormatedLocationNames(_common.GetStringValue(item.cityName, ""));
                        model.resultDetails.Add(results);
                    }
                }
            }
        }
        public string fcnOldBrowsetoNewBrowseLink(string _browsePage)
        {
            var _url = string.Empty;
            #region New typed BrowseLocation Link from Old typed BrowseLocation Link
            if (_browsePage == "location")
            {
                _countryId = _common.GetQueryStringValue("co", "");
                _stateId = _common.GetQueryStringValue("st", "");
                _cityId = _common.GetQueryStringValue("ci", "");
                if (!String.IsNullOrWhiteSpace(_countryId)) { _countryId = _countryId.Replace("/", ""); _countryId = _countryId.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_stateId)) { _stateId = _stateId.Replace("/", ""); _stateId = _stateId.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_cityId)) { _cityId = _cityId.Replace("/", ""); _cityId = _cityId.Replace(".html", ""); }

                if (!String.IsNullOrWhiteSpace(_countryId) || !String.IsNullOrWhiteSpace(_stateId) || !String.IsNullOrWhiteSpace(_cityId))
                {
                    var _locations = _countryService.GetLocationNamesByIds(_common.GetIntegerValue(_countryId, 0), _common.GetIntegerValue(_stateId, 0), _common.GetIntegerValue(_cityId, 0)).SingleOrDefault();
                    if (_locations != null)
                    {
                        _countryAbbr = _common.GetStringValue(_locations.countryAbbr, "");
                        _stateName = _common.GetStringValue(_locations.statename, "");
                        _cityName = _common.GetStringValue(_locations.cityName, "");
                    }
                    _locations = null;
                    if (!String.IsNullOrWhiteSpace(_countryId)) { _url = _countryAbbr; }
                    if (!String.IsNullOrWhiteSpace(_stateId)) { _url += "/" + _stateName; }
                    if (!String.IsNullOrWhiteSpace(_cityId)) { _url += "/" + _cityName; }
                }
            }
            #endregion

            #region New typed BrowseDate Link from Old typed BrowseDate Link
            if (_browsePage == "date")
            {
                _startyear = _common.GetQueryStringValue("fyr", "");
                _startmonth = _common.GetQueryStringValue("fmn", "");
                _startday = _common.GetQueryStringValue("fdy", "");
                _endyear = _common.GetQueryStringValue("lyr", "");
                if (!String.IsNullOrWhiteSpace(_startyear)) { _startyear = _startyear.Replace("/", ""); _startyear = _startyear.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_startmonth)) { _startmonth = _startmonth.Replace("/", ""); _startmonth = _startmonth.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_startday)) { _startday = _startday.Replace("/", ""); _startday = _startday.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_endyear)) { _endyear = _endyear.Replace("/", ""); _endyear = _endyear.Replace(".html", ""); }
                if (!String.IsNullOrWhiteSpace(_startyear))
                {
                    if (!String.IsNullOrWhiteSpace(_endyear)) { if (_startyear != _endyear) { _url = _startyear + "-" + _endyear; } else { _url = _startyear; } }
                    if (!String.IsNullOrWhiteSpace(_startmonth) && !String.IsNullOrWhiteSpace(_startday)) { _url = _startyear + "-" + _startmonth + "-" + _startday; }
                    if (!String.IsNullOrWhiteSpace(_startmonth) && String.IsNullOrWhiteSpace(_startday)) { _url = _startyear + "-" + _startmonth + "-01" + "/" + GetLastDayOfMonth(_common.GetIntegerValue(_startyear, 0), _common.GetIntegerValue(_startmonth, 0)); }
                }
            }
            #endregion
            return _url;
        }

        public void SetBrowseCookieGet(BrowseResultsModel model, string _browsePage)
        {
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if ((Response.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null))
            {
                Response.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
            }
            #region BrowseLocation Fields
            if (_browsePage == "location")
            {
                _countryAbbr = _common.GetQueryStringValue("country", "");
                _stateName = _common.GetQueryStringValue("state", "");
                _cityName = _common.GetQueryStringValue("city", "");

                if (!String.IsNullOrWhiteSpace(_countryAbbr)) { _countryAbbr = _countryAbbr.Replace("/", ""); model.Location.CountryAbbr = _countryAbbr; }
                if (!String.IsNullOrWhiteSpace(_stateName)) { _stateName = _stateName.Replace("/", ""); model.Location.StateName = _stateName; }
                if (!String.IsNullOrWhiteSpace(_cityName)) { _cityName = _cityName.Replace("/", ""); model.Location.CityName = _cityName; }

                if (!String.IsNullOrWhiteSpace(_countryAbbr) || !String.IsNullOrWhiteSpace(_stateName) || !String.IsNullOrWhiteSpace(_cityName))
                {
                    var _locations = _countryService.GetLocationIdsByNames(_countryAbbr, _stateName, _cityName).SingleOrDefault();
                    if (_locations != null)
                    {
                        _countryId = _common.GetStringValue(_locations.countryid, "");
                        _stateId = _common.GetStringValue(_locations.stateid, "");
                        _cityId = _common.GetStringValue(_locations.cityid, "");
                    }
                    _locations = null;
                }
            }
            else
            {
                if (hcBrowse != null)
                {
                    _countryId = _common.GetStringValue(hcBrowse.Values["countryid"], "0");
                    _stateId = _common.GetStringValue(hcBrowse.Values["stateid"], "0");
                    _cityId = _common.GetStringValue(hcBrowse.Values["cityid"], "0");
                }
            }
            #endregion

            #region BrowseDate Fields
            if (_browsePage == "date")
            {
                _startyear = _common.GetQueryStringValue("yr", "");
                _startmonth = _common.GetQueryStringValue("mn", "");
                _startday = _common.GetQueryStringValue("dy", "");
                _endyear = _common.GetQueryStringValue("eyr", "");
                _endmonth = _common.GetQueryStringValue("emn", "");
                _endday = _common.GetQueryStringValue("edy", "");

                if (!String.IsNullOrWhiteSpace(_startyear)) { _startyear = _startyear.Replace("/", ""); }
                if (!String.IsNullOrWhiteSpace(_startmonth)) { _startmonth = _startmonth.Replace("/", ""); }
                if (!String.IsNullOrWhiteSpace(_startday)) { _startday = _startday.Replace("/", ""); }
                if (!String.IsNullOrWhiteSpace(_endyear)) { _endyear = _endyear.Replace("/", ""); }
                if (!String.IsNullOrWhiteSpace(_endmonth)) { _endmonth = _endmonth.Replace("/", ""); }
                if (!String.IsNullOrWhiteSpace(_endday)) { _endday = _endday.Replace("/", ""); }

                if (!String.IsNullOrWhiteSpace(_startyear) && String.IsNullOrWhiteSpace(_startmonth) && String.IsNullOrWhiteSpace(_startday) && String.IsNullOrWhiteSpace(_endyear) && String.IsNullOrWhiteSpace(_endmonth) && String.IsNullOrWhiteSpace(_endday)) { _endyear = _startyear; }
            }
            else
            {
                if (hcBrowse != null)
                {
                    _startyear = _common.GetStringValue(hcBrowse.Values["year"], "");
                    _startmonth = _common.GetStringValue(hcBrowse.Values["month"], "");
                    _startday = _common.GetStringValue(hcBrowse.Values["day"], "");
                    _endyear = _common.GetStringValue(hcBrowse.Values["endyear"], "");
                    _endmonth = _common.GetStringValue(hcBrowse.Values["endmonth"], "");
                    _endday = _common.GetStringValue(hcBrowse.Values["endday"], "");
                }
            }
            #endregion

            #region BrowseArticle Field
            if (_browsePage == "article") { _titleInitial = _common.GetQueryStringValue("a", ""); if (!String.IsNullOrWhiteSpace(_titleInitial)) { _titleInitial = _titleInitial.Replace("/", ""); } }
            else { if (hcBrowse != null) { _titleInitial = _common.GetStringValue(hcBrowse.Values["titleinitial"], ""); } }
            #endregion

            #region Remove cookie fields from browse filters
            string _removeFilters = _common.GetQueryStringValue("rvfield", "").Replace("/", "");
            if (_removeFilters == "co") { _countryId = "0"; _stateId = "0"; _cityId = "0"; }
            if (_removeFilters == "st") { _stateId = "0"; _cityId = "0"; }
            if (_removeFilters == "ct") { _cityId = "0"; }

            if (_removeFilters == "ex" || _removeFilters == "by" || _removeFilters == "bd") { _startyear = string.Empty; _startmonth = string.Empty; _startday = string.Empty; _endyear = string.Empty; _endmonth = string.Empty; _endday = string.Empty; }

            if (_removeFilters == "ti") { _titleInitial = string.Empty; }
            #endregion
            if (String.IsNullOrWhiteSpace(_countryId)) { _countryId = "0"; }
            if (String.IsNullOrWhiteSpace(_stateId)) { _stateId = "0"; }
            if (String.IsNullOrWhiteSpace(_cityId)) { _cityId = "0"; }

            #region BrowseLocation Cookie Check and Reset
            if (hcBrowse != null)
            {
                var _recordsPerPage = _common.GetIntegerValue(hcBrowse.Values["resultsperpage"], 0);
                if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; } else { model.ResultsPageCount = 15; }
                if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
                {
                    Request.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
                }
            }

            Response.Cookies.Add(_clsCookie.fcnCreateBrowseLocationsCookie(
                _common.GetStringValue(_countryId, "0"),
                _common.GetStringValue(_stateId, "0"),
                _common.GetStringValue(_cityId, "0"), "0",
                _common.GetStringValue(_startyear, ""),
                _common.GetStringValue(_startmonth, ""),
                _common.GetStringValue(_startday, ""),
                _common.GetStringValue(_endyear, ""),
                _common.GetStringValue(_endmonth, ""),
                _common.GetStringValue(_endday, ""),
                _common.GetStringValue(_titleInitial, ""), "", "", "",
                _config.GetStringValueFromConfig("cookieTimeout", "100"), _config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com"),
                _common.GetStringValue(model.ResultsPageCount, "15")
               ));

            #endregion
        }

        public void LocationDropDownPopulate(BrowseResultsModel model)
        {
            #region Value Set into Location Filters From BrowseLocation Cookie
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if (hcBrowse != null)
            {
                _countryId = _common.GetStringValue(hcBrowse.Values["countryid"], "0");
                _stateId = _common.GetStringValue(hcBrowse.Values["stateid"], "0");
                _cityId = _common.GetStringValue(hcBrowse.Values["cityid"], "0");
                _pubId = _common.GetStringValue(hcBrowse.Values["titleid"], "0");
            }
            #endregion

            #region Reset Location DropDowns from Location Filters
            //Country Dropdown
            model.Location.AvailableCountries.Clear();
            var allCountry = _weblocationpubtitlesService.GetAllCountries();
            if (allCountry != null)
                model.Location.AvailableCountries = allCountry.Select(c => new SelectListItem() { Text = c.countryName, Value = c.countryid.ToString() }).ToList();
            model.Location.CountryID = _common.GetStringValue(_countryId, "0");
            TempData["Country"] = model.Location.CountryID;
            _countryName = model.Location.AvailableCountries.Where(p => p.Value == _countryId).ToList().Select(p => p.Text).FirstOrDefault();
            if (!String.IsNullOrWhiteSpace(_countryName)) { model.Location.CountryName = _common.GetStringValue(_countryName, ""); }

            //State dropdown
            model.Location.AvailableStates.Clear();
            if (!string.IsNullOrWhiteSpace(model.Location.CountryID) && model.Location.CountryID != "0")
            {
                var statesByCountryId = _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(model.Location.CountryID, 0));
                if (statesByCountryId != null)
                    model.Location.AvailableStates = statesByCountryId.Select(c => new SelectListItem() { Text = c.stateName, Value = c.stateid.ToString() }).ToList();
            }
            model.Location.StateID = _common.GetStringValue(_stateId, "0");
            TempData["State"] = model.Location.StateID;
            _stateName = model.Location.AvailableStates.Where(p => p.Value == _stateId).ToList().Select(p => p.Text).FirstOrDefault();
            if (!String.IsNullOrWhiteSpace(_stateName)) { model.Location.StateName = _common.GetStringValue(_stateName, ""); }

            //City dropdown
            model.Location.AvailableCities.Clear();
            if (!string.IsNullOrWhiteSpace(model.Location.StateID) && model.Location.StateID != "0")
            {
                var citiesByStateId = _weblocationpubtitlesService.GetCitiesByStateId(_common.GetIntegerValue(model.Location.StateID, 0));
                if (citiesByStateId != null)
                    model.Location.AvailableCities = citiesByStateId.Select(c => new SelectListItem() { Text = c.cityName, Value = c.cityid.ToString() }).ToList();
            }
            model.Location.CityID = _common.GetStringValue(_cityId, "0");
            TempData["City"] = model.Location.CityID;
            _cityName = model.Location.AvailableCities.Where(p => p.Value == _cityId).ToList().Select(p => p.Text).FirstOrDefault();
            if (!String.IsNullOrWhiteSpace(_cityName)) { model.Location.CityName = _common.GetStringValue(_cityName, ""); }

            model.Location.IsPublicationLocation = true;
            _pubId = _common.GetStringValue(model.Location.PublicationTitleID, "");

            //Title dropdown
            if (!string.IsNullOrWhiteSpace(model.Location.CityID) && model.Location.CityID != "0")
            {
                var titlesWithYearByCityId = _weblocationpubtitlesService.GetTitlesWithYearByCityId(_common.GetIntegerValue(model.Location.CityID, 0));
                if (titlesWithYearByCityId != null)
                    model.Location.AvailablePubTitles = titlesWithYearByCityId.Select(c => new SelectListItem() { Text = c.pubTitle + " (" + c.minPubDateYear + " - " + c.maxPubDateYear + ")", Value = c.pubID.ToString() }).ToList();
            }
            model.Location.PublicationTitleID = _pubId;
            TempData["Publication"] = model.Location.PublicationTitleID;
            _titleName = model.Location.AvailablePubTitles.Where(p => p.Value == _pubId).ToList().Select(p => p.Text).FirstOrDefault();

            if (!String.IsNullOrWhiteSpace(_titleName)) { model.Location.PublicationTitle = _common.GetStringValue(_titleName, ""); }
            model.Location.IsPublicationLocation = true;

            #endregion
        }

        public void DatesDropDownPopulate(BrowseResultsModel model)
        {
            #region Value Set into Date Filters From BrowseLocation Cookie
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if (hcBrowse != null)
            {
                _startyear = _common.GetStringValue(hcBrowse.Values["year"], "");
                _startmonth = _common.GetStringValue(hcBrowse.Values["month"], "");
                _startday = _common.GetStringValue(hcBrowse.Values["day"], "");
                _endyear = _common.GetStringValue(hcBrowse.Values["endyear"], "");
                _endmonth = _common.GetStringValue(hcBrowse.Values["endmonth"], "");
                _endday = _common.GetStringValue(hcBrowse.Values["endday"], "");
            }
            if (!string.IsNullOrWhiteSpace(_startmonth))
            {
                if (_common.GetStringValue(_startmonth, "0").StartsWith("0")) { _startmonth = _common.GetStringValue(_startmonth, "0").Replace(_common.GetStringValue(_startmonth, "0").Substring(0, 1), ""); }
                else { _startmonth = _common.GetStringValue(_startmonth, "0"); }
            }
            if (!string.IsNullOrWhiteSpace(_startday))
            {
                if (_common.GetStringValue(_startday, "0").StartsWith("0")) { _startday = _common.GetStringValue(_startday, "").Replace(_common.GetStringValue(_startday, "0").Substring(0, 1), ""); }
                else { _startday = _common.GetStringValue(_startday, ""); }
            }
            if (!string.IsNullOrWhiteSpace(_endmonth))
            {
                if (_common.GetStringValue(_endmonth, "0").StartsWith("0")) { _endmonth = _common.GetStringValue(_endmonth, "0").Replace(_common.GetStringValue(_endmonth, "0").Substring(0, 1), ""); }
                else { _endmonth = _common.GetStringValue(_endmonth, "0"); }
            }
            if (!string.IsNullOrWhiteSpace(_endday))
            {
                if (_common.GetStringValue(_endday, "0").StartsWith("0")) { _endday = _common.GetStringValue(_endday, "").Replace(_common.GetStringValue(_endday, "0").Substring(0, 1), ""); }
                else { _endday = _common.GetStringValue(_endday, ""); }
            }
            #endregion

            #region Reset Date DropDowns from Date Filters
            // Commented by Vishal Tyagi as
            //model.Dates.AvailableStartYears.Clear();
            //foreach (var c in _dateService.GetAllYears())
            //    model.Dates.AvailableStartYears.Add(new SelectListItem() { Text = c.startYear, Value = c.yearID.ToString() });

            //model.Dates.AvailableStartMonths.Clear();
            //foreach (var c in _dateService.GetAllMonths())
            //    model.Dates.AvailableStartMonths.Add(new SelectListItem() { Text = c.startMonthName, Value = c.startMonth.ToString() });

            //model.Dates.AvailableStartDays.Clear();
            //foreach (var c in _dateService.GetAllDays())
            //    model.Dates.AvailableStartDays.Add(new SelectListItem() { Text = c.startDay, Value = c.dayID.ToString() });

            //model.Dates.AvailableEndMonths.Clear();
            //foreach (var c in _dateService.GetAllMonths())
            //    model.Dates.AvailableEndMonths.Add(new SelectListItem() { Text = c.startMonthName, Value = c.startMonth.ToString() });

            //model.Dates.AvailableEndDays.Clear();
            //foreach (var c in _dateService.GetAllDays())
            //    model.Dates.AvailableEndDays.Add(new SelectListItem() { Text = c.startDay, Value = c.dayID.ToString() });
            #region Reset Date DropDowns from Date Filters
            model.Dates.AvailableStartYears.Clear();
            model.Dates.AvailableStartMonths.Clear();
            model.Dates.AvailableStartDays.Clear();
            model.Dates.AvailableEndMonths.Clear();
            model.Dates.AvailableEndDays.Clear();
            var _DateHelper = new DatesHelper(_cacheManager);
            Dates[] enums = { Dates.AvailableStartYears, Dates.AvailableStartMonths, Dates.AvailableStartDays, Dates.AvailableEndMonths, Dates.AvailableEndDays };
            _DateHelper.SetDates(model.Dates, _dateService, enums);
            #endregion
            //****************Dates Populates Ended**********************

            if (!string.IsNullOrWhiteSpace(_startyear))
            {
                model.Dates.StartYear = _common.GetStringValue(_startyear, "");
                model.Dates.BetweenStartYear = _common.GetStringValue(_startyear, "");
                model.Dates.BetweenDatesYear = _common.GetStringValue(_startyear, "");
                model.Dates.IsPublicationDate = true;

                model.Dates.AvailableEndYears.Clear();
                foreach (var c in _dateService.GetAllEndYears(_common.GetIntegerValue(model.Dates.StartYear, 0)))
                    model.Dates.AvailableEndYears.Add(new SelectListItem() { Text = c.endYear, Value = c.endYear.ToString() });
            }

            if (!String.IsNullOrWhiteSpace(_startyear) && !String.IsNullOrWhiteSpace(_startmonth) && !String.IsNullOrWhiteSpace(_endyear))
            {
                model.Dates.IsBetweenDates = true;
            }
            else if (!String.IsNullOrWhiteSpace(_startyear) && !String.IsNullOrWhiteSpace(_startmonth) && String.IsNullOrWhiteSpace(_endyear))
            {
                model.Dates.IsExactDate = true;
            }
            else if (!String.IsNullOrWhiteSpace(_startyear) && String.IsNullOrWhiteSpace(_startmonth) && !String.IsNullOrWhiteSpace(_endyear))
            {
                model.Dates.IsBetweenYears = true;
            }

            //if (model.Dates.IsExactDate)
            //{
            //    if (!string.IsNullOrWhiteSpace(_startmonth)) { model.Dates.StartMonth = _common.GetStringValue(_startmonth, ""); }
            //    if (!string.IsNullOrWhiteSpace(_startday)) { model.Dates.StartDay = _common.GetStringValue(_startday, ""); }

            //    model.Dates.BetweenStartYear = "";
            //    model.Dates.BetweenDatesYear = "";

            //    model.Dates.BetweenDatesMonth = "";
            //    model.Dates.BetweenDatesDay = "";
            //}
            //if (model.Dates.IsBetweenYears)
            //{
            //    if (!string.IsNullOrWhiteSpace(_endyear)) { model.Dates.BetweenEndYear = _common.GetStringValue(_endyear, ""); }

            //    model.Dates.StartYear = "";
            //    model.Dates.BetweenDatesYear = "";

            //    model.Dates.EndYear = "";
            //}
            //if (model.Dates.IsBetweenDates)
            //{
            //    if (!string.IsNullOrWhiteSpace(_startmonth)) { model.Dates.BetweenDatesMonth = _common.GetStringValue(_startmonth, ""); }
            //    if (!string.IsNullOrWhiteSpace(_startday)) { model.Dates.BetweenDatesDay = _common.GetStringValue(_startday, ""); }
            //    if (!string.IsNullOrWhiteSpace(_endyear)) { model.Dates.EndYear = _common.GetStringValue(_endyear, ""); }
            //    if (!string.IsNullOrWhiteSpace(_endmonth)) { model.Dates.EndMonth = _common.GetStringValue(_endmonth, ""); }
            //    if (!string.IsNullOrWhiteSpace(_endday)) { model.Dates.EndDay = _common.GetStringValue(_endday, ""); }

            //    model.Dates.StartYear = "";
            //    model.Dates.BetweenStartYear = "";
            //}
            //Updated by : Amit Kumar Srivastava
            //Updated Date : 18 september 2013.
            //Purpose : Task No. 252,  commented above section due to blank all other Dates rather then selected in model.
            //Start
            if (model.Dates.IsExactDate)
            {

                if (!string.IsNullOrWhiteSpace(_startyear)) { model.Dates.StartYear = _common.GetStringValue(_startyear, ""); }
                if (!string.IsNullOrWhiteSpace(_startmonth)) { model.Dates.StartMonth = _common.GetStringValue(_startmonth, ""); }
                if (!string.IsNullOrWhiteSpace(_startday)) { model.Dates.StartDay = _common.GetStringValue(_startday, ""); }


                model.Dates.BetweenStartYear = "";
                model.Dates.BetweenEndYear = "";

                model.Dates.BetweenDatesYear = "";
                model.Dates.BetweenDatesMonth = "";
                model.Dates.BetweenDatesDay = "";

                model.Dates.EndYear = "";
                model.Dates.EndMonth = "";
                model.Dates.EndDay = "";

            }
            else if (model.Dates.IsBetweenYears)
            {
                if (!string.IsNullOrWhiteSpace(_startyear)) { model.Dates.BetweenStartYear = _common.GetStringValue(_startyear, ""); }
                if (!string.IsNullOrWhiteSpace(_endyear)) { model.Dates.BetweenEndYear = _common.GetStringValue(_endyear, ""); }

                model.Dates.StartYear = "";
                model.Dates.StartMonth = "";
                model.Dates.StartDay = "";

                model.Dates.BetweenDatesYear = "";
                model.Dates.BetweenDatesMonth = "";
                model.Dates.BetweenDatesDay = "";

                model.Dates.EndYear = "";
                model.Dates.EndMonth = "";
                model.Dates.EndDay = "";
            }
            else if (model.Dates.IsBetweenDates)
            {
                if (!string.IsNullOrWhiteSpace(_startyear)) { model.Dates.BetweenDatesYear = _common.GetStringValue(_startyear, ""); }
                if (!string.IsNullOrWhiteSpace(_startmonth)) { model.Dates.BetweenDatesMonth = _common.GetStringValue(_startmonth, ""); }
                if (!string.IsNullOrWhiteSpace(_startday)) { model.Dates.BetweenDatesDay = _common.GetStringValue(_startday, ""); }
                if (!string.IsNullOrWhiteSpace(_endyear)) { model.Dates.EndYear = _common.GetStringValue(_endyear, ""); }
                if (!string.IsNullOrWhiteSpace(_endmonth)) { model.Dates.EndMonth = _common.GetStringValue(_endmonth, ""); }
                if (!string.IsNullOrWhiteSpace(_endday)) { model.Dates.EndDay = _common.GetStringValue(_endday, ""); }

                model.Dates.StartYear = "";
                model.Dates.StartMonth = "";
                model.Dates.StartDay = "";

                model.Dates.BetweenStartYear = "";
                model.Dates.BetweenEndYear = "";
            }
            else
            {
                model.Dates.BetweenStartYear = "";
                model.Dates.BetweenEndYear = "";

                model.Dates.StartYear = "";
                model.Dates.StartMonth = "";
                model.Dates.StartDay = "";

                model.Dates.BetweenDatesYear = "";
                model.Dates.BetweenDatesMonth = "";
                model.Dates.BetweenDatesDay = "";

                model.Dates.EndYear = "";
                model.Dates.EndMonth = "";
                model.Dates.EndDay = "";
            }
            //End
            #endregion
        }

        public string SearchModelObj(BrowseResultsModel model)
        {
            var searchModel = new SearchResultsModel();
            searchModel.Dates = model.Dates;
            searchModel.Location = model.Location;
            searchModel.FirstName = model.FirstName;
            searchModel.LastName = model.LastName;
            searchModel.AllOfTheWordsString = model.AllOfTheWordsString;
            searchModel.ExactPhraseString = model.ExactPhraseString;
            searchModel.AnyOfTheWordsString = model.AnyOfTheWordsString;
            searchModel.WithoutWordsString = model.WithoutWordsString;

            if (!string.IsNullOrWhiteSpace(searchModel.AllOfTheWordsString)) { if (searchModel.AllOfTheWordsString.Trim().ToLower() == "battle gettysburg civil war") { searchModel.AllOfTheWordsString = ""; } }
            if (!string.IsNullOrWhiteSpace(searchModel.AnyOfTheWordsString)) { if (searchModel.AnyOfTheWordsString.Trim().ToLower() == "soldier infantry") { searchModel.AnyOfTheWordsString = ""; } }
            if (!string.IsNullOrWhiteSpace(searchModel.ExactPhraseString)) { if (searchModel.ExactPhraseString.Trim().ToLower() == "john smith buried") { searchModel.ExactPhraseString = ""; } }
            if (!string.IsNullOrWhiteSpace(searchModel.WithoutWordsString)) { if (searchModel.WithoutWordsString.Trim().ToLower() == "adams george henry") { searchModel.WithoutWordsString = ""; } }

            if (String.IsNullOrWhiteSpace(searchModel.AllOfTheWordsString) && String.IsNullOrWhiteSpace(searchModel.ExactPhraseString) && String.IsNullOrWhiteSpace(searchModel.AnyOfTheWordsString) && String.IsNullOrWhiteSpace(searchModel.LastName))
            {
                return string.Empty;
            }

            var helper = new SearchHelper(_savedSearchService, _common);
            if (searchModel.Dates.IsPublicationDate == false) { searchModel.Dates = new DateModels(); }
            else
            {
                if (searchModel.Dates.IsExactDate == true)
                {
                    searchModel.Dates.EndYear = "";
                    searchModel.Dates.EndMonth = "";
                    searchModel.Dates.EndDay = "";
                }
                if (searchModel.Dates.IsBetweenYears == true)
                {
                    searchModel.Dates.StartYear = searchModel.Dates.BetweenStartYear;
                    searchModel.Dates.EndYear = searchModel.Dates.BetweenEndYear;

                    searchModel.Dates.StartMonth = "";
                    searchModel.Dates.StartDay = "";
                    searchModel.Dates.EndMonth = "";
                    searchModel.Dates.EndDay = "";
                }
                if (searchModel.Dates.IsBetweenDates == true)
                {
                    searchModel.Dates.StartYear = searchModel.Dates.BetweenDatesYear;
                    searchModel.Dates.StartMonth = searchModel.Dates.BetweenDatesMonth;
                    searchModel.Dates.StartDay = searchModel.Dates.BetweenDatesDay;
                }
            }

            if (searchModel.Location.IsPublicationLocation == false) { searchModel.Location = new LocationModels(); }
            string _url = helper.getURLfromSearchValues(searchModel, "", 0);

            return _url;
        }

        public void FetchResultDetails(IList<Na.Core.Domain.Browse.BrowseData> resultdetails, BrowseResultsModel model, int? page)
        {

            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            var _recordsPerPage = _common.GetIntegerValue(model.hdnRecordsPerPage, 0);
            if (hcBrowse != null && _recordsPerPage == 0) { _recordsPerPage = _common.GetIntegerValue(hcBrowse.Values["resultsperpage"], 0); }

            int startIndex = (page ?? 1);
            if (resultdetails != null && resultdetails.Count > 0)
            {
                if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; } else { model.ResultsPageCount = 15; }

                //var _resultPerpage = new List<SelectListItem>();
                //_resultPerpage.Add(new SelectListItem { Value = "10", Text = "10", Selected = 10 == _recordsPerPage ? true : false });
                //_resultPerpage.Add(new SelectListItem { Value = "20", Text = "20", Selected = 20 == _recordsPerPage ? true : false });
                //_resultPerpage.Add(new SelectListItem { Value = "30", Text = "30", Selected = 30 == _recordsPerPage ? true : false });
                //model.ResulsPerPage = _resultPerpage;

                var _resultPerpage = new List<SelectListItem>();
                _resultPerpage.Add(new SelectListItem { Value = "15", Text = "15", Selected = 15 == _recordsPerPage ? true : false });
                _resultPerpage.Add(new SelectListItem { Value = "30", Text = "30", Selected = 30 == _recordsPerPage ? true : false });
                model.ResulsPerPage = _resultPerpage;

                var result = resultdetails.AsEnumerable();
                // result = model.results = resultdetails.ToPagedList(startIndex, _common.GetIntegerValue(model.ResultsPageCount, 15)); //resultdetails.Skip(startIndex).Take(RecordsPerPage);

                foreach (var item in result)
                {
                    var results = new Na.Website.Models.Browse.BrowseResultsDetailsModel();
                    results.cityid = _common.GetIntegerValue(item.cityid, 0);
                    results.stateid = _common.GetIntegerValue(item.stateid, 0);
                    results.countryid = _common.GetIntegerValue(item.countryid, 0);
                    results.cityName = _common.GetStringValue(item.cityName, "");
                    results.statename = _common.GetStringValue(item.statename, "");
                    results.countryname = _common.GetStringValue(item.countryname, "");
                    results.pubTitle = _common.GetStringValue(item.pubTitle, "");
                    results.formatedPubTitle = _common.GetStringValue(item.pubTitleURL, "");  //ReplaceTHE_RemoveSpecialChar(_common.GetStringValue(item.pubTitle, "").ToLower());
                    results.pubid = _common.GetIntegerValue(item.pubid, 0);
                    results.MaxPubdateYear = _common.GetStringValue(item.MaxPubdateYear, "");
                    results.MinPubdateYear = _common.GetStringValue(item.MinPubdateYear, "");
                    if (results.MaxPubdateYear != "" && (results.MaxPubdateYear == results.MinPubdateYear))
                    {
                        results.PubdateYearRange = results.MaxPubdateYear;
                    }
                    else
                    {
                        results.PubdateYearRange = results.MinPubdateYear + " - " + results.MaxPubdateYear;
                    }
                    results.countryAbbr = _common.GetStringValue(item.CountryUrlText, "").Replace(" ", "");
                    results.formatedStateName = FormatedLocationNames(_common.GetStringValue(item.statename, ""));
                    results.formatedCityName = FormatedLocationNames(_common.GetStringValue(item.cityName, ""));
                    model.resultDetails.Add(results);
                }
            }
        }

        public string BrowsePagePost(BrowseResultsModel model, string _browsePage)
        {
            var _url = string.Empty;
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            //If there are any valid search term then first priority to search otherwise browse with filters
            _url = SearchModelObj(model);

            if (String.IsNullOrWhiteSpace(_url))
            {
                //************* Set BrowseLocation Cookie for Browse Pages ****************
                SetBrowseCookiePost(model);

                //************* Get browseUrl for redirection *********************                
                _url = fncBrowseRedirect(model, _browsePage);
            }
            return _url;
        }

        public void SetBrowseCookiePost(BrowseResultsModel model)
        {
            #region Set values for Location/Date/TitleInitial Filters
            //***************** Set Location Filters *************************           
            _countryId = _common.GetStringValue(model.Location.CountryID, "");
            _stateId = _common.GetStringValue(model.Location.StateID, "");
            _cityId = _common.GetStringValue(model.Location.CityID, "");
            _pubId = _common.GetStringValue(model.Location.PublicationTitleID, "");

            //**************** Set Date Filters *****************************
            if (model.Dates.IsExactDate && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.StartYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.StartYear, "");
                _startmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.StartMonth, "1"));
                _startday = DropDownDatesFormat(_common.GetStringValue(model.Dates.StartDay, "1"));
            }
            else if (model.Dates.IsBetweenYears && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenStartYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.BetweenStartYear, "");
                _endyear = _common.GetStringValue(model.Dates.BetweenEndYear, "");
            }
            else if (model.Dates.IsBetweenDates && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenDatesYear, "")) && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.EndYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.BetweenDatesYear, "");
                _startmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesMonth, "1"));
                _startday = DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesDay, "1"));
                _endyear = _common.GetStringValue(model.Dates.EndYear, "");
                _endmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.EndMonth, "12"));
                _endday = DropDownDatesFormat(_common.GetStringValue(model.Dates.EndDay, "31"));
            }
            else
            {
                _startyear = string.Empty;
                _startmonth = string.Empty;
                _startday = string.Empty;
                _endyear = string.Empty;
                _endmonth = string.Empty;
                _endday = string.Empty;
            }
            #endregion

            #region Set BrowseLocation Cookie for Redirect with BrowseLinks
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if ((Response.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null))
            {
                Response.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
            }
            if (hcBrowse != null)
            {
                _titleInitial = _common.GetStringValue(hcBrowse.Values["titleinitial"], "");
                //********** Set resultsperpage into the dropdown **************
                var _recordsPerPage = _common.GetIntegerValue(model.hdnRecordsPerPage, 0);
                if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; }
                else { model.ResultsPageCount = _common.GetIntegerValue(hcBrowse.Values["resultsperpage"], 15); }
                if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
                {
                    Request.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
                }
                Response.Cookies.Add(_clsCookie.fcnCreateBrowseLocationsCookie(
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_countryId, "")) ? "0" : _common.GetStringValue(_countryId, "0"),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_stateId, "")) ? "0" : _common.GetStringValue(_stateId, "0"),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_cityId, "")) ? "0" : _common.GetStringValue(_cityId, "0"),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_pubId, "")) ? "0" : _common.GetStringValue(_pubId, "0"),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_startyear, "")) ? "" : _common.GetStringValue(_startyear, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_startmonth, "")) ? "" : _common.GetStringValue(_startmonth, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_startday, "")) ? "" : _common.GetStringValue(_startday, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_endyear, "")) ? "" : _common.GetStringValue(_endyear, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_endmonth, "")) ? "" : _common.GetStringValue(_endmonth, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_endday, "")) ? "" : _common.GetStringValue(_endday, ""),
                    String.IsNullOrWhiteSpace(_common.GetStringValue(_titleInitial, "")) ? "" : _common.GetStringValue(_titleInitial, ""), "", "", "",
                    _config.GetStringValueFromConfig("cookieTimeout", "100"), _config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com"),
                      _common.GetStringValue(model.ResultsPageCount, "15")
                   ));
            }
            #endregion
        }

        public string fncBrowseRedirect(BrowseResultsModel model, string _browsePage)
        {
            var _url = string.Empty;

            #region First Check PubTitle to redirect into publication page
            if (!String.IsNullOrWhiteSpace(_pubId))
            {
                //var pubTitle =  _weblocationpubtitlesService.GetTitleByTitleId(_common.GetIntegerValue(_pubId, 0));
                var pubTitle = _BrowseDataService.GetPubTitleURLByPubId(_common.GetIntegerValue(_pubId, 0)).FirstOrDefault();
                if (pubTitle != null) { _titleName = pubTitle.pubTitleURL; }
                if (!String.IsNullOrWhiteSpace(_titleName))
                {
                    _titleName = _titleName.ToLower();
                    if (!String.IsNullOrWhiteSpace(_titleName)) { _url = _titleName; }
                }
            }
            #endregion

            if (String.IsNullOrWhiteSpace(_url))
            {
                #region Redirect to BrowseLocation
                if (_browsePage == "location")
                {
                    _url = "browselocations";
                    if (!String.IsNullOrWhiteSpace(_countryId) || !String.IsNullOrWhiteSpace(_stateId) || !String.IsNullOrWhiteSpace(_cityId))
                    {
                        var _locations = _countryService.GetLocationNamesByIds(_common.GetIntegerValue(_countryId, 0), _common.GetIntegerValue(_stateId, 0), _common.GetIntegerValue(_cityId, 0)).SingleOrDefault();
                        if (_locations != null)
                        {
                            _countryAbbr = _common.GetStringValue(_locations.countryAbbr, "");
                            _stateName = _common.GetStringValue(_locations.statename, "");
                            _cityName = _common.GetStringValue(_locations.cityName, "");
                        }
                        if (!String.IsNullOrWhiteSpace(_countryAbbr)) { _url = _countryAbbr; }
                        if (!String.IsNullOrWhiteSpace(_stateName)) { _url += "/" + _stateName; }
                        if (!String.IsNullOrWhiteSpace(_cityName)) { _url += "/" + _cityName; }
                        _locations = null;
                    }
                }
                #endregion

                #region Redirect to BrowseArticle
                if (_browsePage == "article") { _url = "browsearticles"; if (!String.IsNullOrWhiteSpace(_titleInitial)) { _url += "/" + _titleInitial; } }
                #endregion

                #region Redirect to BrowseDate
                if (_browsePage == "date")
                {
                    if (model.Dates.IsExactDate)
                    {
                        if (!String.IsNullOrWhiteSpace(_startyear))
                        {
                            _url = _startyear;
                            if (!String.IsNullOrWhiteSpace(_url)) { _url += "-" + _common.GetStringValue(_startmonth, "01") + "-" + _common.GetStringValue(_startday, "31"); }
                        }
                    }
                    else if (model.Dates.IsBetweenYears)
                    {
                        if (!String.IsNullOrWhiteSpace(_startyear)) { _url = _startyear; }
                        if (!String.IsNullOrWhiteSpace(_endyear) && _startyear != _endyear) { _url += "-" + _endyear; }
                    }
                    else if (model.Dates.IsBetweenDates)
                    {
                        if (!String.IsNullOrWhiteSpace(_startyear))
                        {
                            _url = _startyear;
                            if (!String.IsNullOrWhiteSpace(_url)) { _url += "-" + _common.GetStringValue(_startmonth, "01") + "-" + _common.GetStringValue(_startday, "31"); }
                            if (!String.IsNullOrWhiteSpace(_endyear)) { _url += "/" + _common.GetStringValue(_endyear, Convert.ToString(DateTime.Now.Year)) + "-" + _common.GetStringValue(_endmonth, "12") + "-" + _common.GetStringValue(_endday, "31"); }
                        }
                    }
                    else
                    {
                        _url = "browsedate";
                    }
                }
                #endregion
            }

            return _url;
        }

        public string BrowseByMapPost(BrowseResultsModel model)
        {
            var _url = string.Empty;
            model.hdnAbsoluteUrl = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/browse"; // Request.Url.AbsoluteUri;
            if (String.IsNullOrWhiteSpace(model.SearchString)) { model.SearchString = string.Empty; }

            //************* Get browseUrl for redirection *********************                

            #region Redirect to BrowseDate

            if (model.Dates.IsExactDate)
            {
                if (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.StartYear, "")))
                {
                    _url = _common.GetStringValue(model.Dates.StartYear, "");
                    if (!String.IsNullOrWhiteSpace(_url))
                    {
                        _url += "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.StartMonth, "1")) + "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.StartDay, "1"));
                    }
                }
            }
            else if (model.Dates.IsBetweenYears)
            {
                if (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenStartYear, ""))) { _url = _common.GetStringValue(model.Dates.BetweenStartYear, ""); }
                if (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenEndYear, "")) && _common.GetStringValue(model.Dates.BetweenStartYear, "") != _common.GetStringValue(model.Dates.BetweenEndYear, "")) { _url += "-" + _common.GetStringValue(model.Dates.BetweenEndYear, ""); }
            }
            else if (model.Dates.IsBetweenDates)
            {
                if (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenDatesYear, "")))
                {
                    _url = _common.GetStringValue(model.Dates.BetweenDatesYear, "");
                    if (!String.IsNullOrWhiteSpace(_url))
                    {
                        _url += "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesMonth, "1")) + "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesDay, "1"));
                    }
                    if (!String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.EndYear, "")))
                    {
                        _url += "/" + _common.GetStringValue(model.Dates.EndYear, Convert.ToString(DateTime.Now.Year)) + "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.EndMonth, "12")) + "-" + DropDownDatesFormat(_common.GetStringValue(model.Dates.EndDay, "31"));
                    }
                }
            }
            else
            {
                _url = "browsedate";
            }

            #endregion

            return _url;
        }

        public void fcnClearCookie()
        {
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = new HttpCookie(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
                hcBrowse.Expires = DateTime.Now.AddDays(-1d);
                Response.Cookies.Add(hcBrowse);
            }
        }

        public void fcnSetBrowseFilters(BrowseResultsModel model, string pagename)
        {
            string _searchTerms = string.Empty;
            DateTime _dt = new DateTime();

            #region Set Date Filters
            if (model.Dates.IsExactDate && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.StartYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.StartYear, "");
                _startmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.StartMonth, "1"));
                _startday = DropDownDatesFormat(_common.GetStringValue(model.Dates.StartDay, "1"));
                var isDate = DateTime.TryParse(_startmonth + "/" + _startday + "/" + _startyear, out _dt);
                if (isDate)
                {
                    _dt = new DateTime(_common.GetIntegerValue(_startyear, 0), _common.GetIntegerValue(_startmonth, 0), _common.GetIntegerValue(_startday, 0));
                    _searchTerms = FormatBrowseFilterButtons(String.Format("{0:MMM dd, yyyy}", _dt), "ex", pagename);
                }
            }
            else if (model.Dates.IsBetweenYears && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenStartYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.BetweenStartYear, "");
                _endyear = _common.GetStringValue(model.Dates.BetweenEndYear, "");
                _searchTerms = FormatBrowseFilterButtons(_startyear + "-" + _endyear, "by", pagename);
            }
            else if (model.Dates.IsBetweenDates && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.BetweenDatesYear, "")) && !String.IsNullOrWhiteSpace(_common.GetStringValue(model.Dates.EndYear, "")))
            {
                _startyear = _common.GetStringValue(model.Dates.BetweenDatesYear, "");
                _startmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesMonth, "1"));
                _startday = DropDownDatesFormat(_common.GetStringValue(model.Dates.BetweenDatesDay, "1"));
                _endyear = _common.GetStringValue(model.Dates.EndYear, "");
                _endmonth = DropDownDatesFormat(_common.GetStringValue(model.Dates.EndMonth, "12"));
                _endday = DropDownDatesFormat(_common.GetStringValue(model.Dates.EndDay, "31"));
                var isDate = DateTime.TryParse(_startmonth + "/" + _startday + "/" + _startyear, out _dt);
                if (isDate)
                {
                    _dt = new DateTime(_common.GetIntegerValue(_startyear, 0), _common.GetIntegerValue(_startmonth, 0), _common.GetIntegerValue(_startday, 0));
                    _searchTerms = String.Format("{0:MMM dd, yyyy}", _dt);
                }
                isDate = DateTime.TryParse(_endmonth + "/" + _endday + "/" + _endyear, out _dt);
                if (isDate)
                {
                    _dt = new DateTime(_common.GetIntegerValue(_endyear, 0), _common.GetIntegerValue(_endmonth, 0), _common.GetIntegerValue(_endday, 0));
                    _searchTerms += "-" + String.Format("{0:MMM dd, yyyy}", _dt);
                }

                _searchTerms = FormatBrowseFilterButtons(_searchTerms, "bd", pagename);
            }
            #endregion

            #region Set Location Filters
            if (!String.IsNullOrWhiteSpace(_countryName) && !String.IsNullOrWhiteSpace(_stateName) && !String.IsNullOrWhiteSpace(_cityName))
            {
                _searchTerms += FormatBrowseFilterButtons(_countryName, "co", pagename) + FormatBrowseFilterButtons(_stateName, "st", pagename) + FormatBrowseFilterButtons(_cityName, "ct", pagename);
            }
            else if (!String.IsNullOrWhiteSpace(_countryName) && !String.IsNullOrWhiteSpace(_stateName) && String.IsNullOrWhiteSpace(_cityName))
            {
                _searchTerms += FormatBrowseFilterButtons(_countryName, "co", pagename) + FormatBrowseFilterButtons(_stateName, "st", pagename);
            }
            else if (!String.IsNullOrWhiteSpace(_countryName) && String.IsNullOrWhiteSpace(_stateName) && String.IsNullOrWhiteSpace(_cityName))
            {
                _searchTerms += FormatBrowseFilterButtons(_countryName, "co", pagename);
            }
            #endregion

            #region Set TitleInitial
            if (!String.IsNullOrWhiteSpace(_titleInitial)) { _searchTerms += FormatBrowseFilterButtons("Title Initial: " + _titleInitial, "ti", pagename); }
            #endregion

            model.BrowseFilters = _searchTerms;
        }

        public string ReplaceTHE_RemoveSpecialChar(string inputString)
        {
            string outputString = inputString.Trim();
            string lowinputString = outputString.ToLower();
            if (lowinputString.Substring(lowinputString.Length - 3, 3) == "the")
            {
                if (lowinputString.Substring(lowinputString.LastIndexOf("the")) == "the")
                {
                    outputString = outputString.Substring(0, outputString.Length - 3);
                    outputString = outputString.Trim();
                    if (outputString.Substring(outputString.LastIndexOf(",")) == ",")
                    {
                        outputString = outputString.Substring(0, outputString.Length - 1);
                    }
                    outputString = "The " + outputString;
                }
            }
            outputString = outputString.Replace("    ", " ").Replace("   ", " ").Replace("  ", " ").Replace(" - ", "-").Replace("  -  ", "-").Replace(" ", "-").Replace("\\", "").Replace("/", "").Replace(":", "").Replace("*", "").Replace("?", "").Replace("\"", "").Replace("<", "").Replace(">", "").Replace("|", "").Replace(",", "").Replace("'", "").Replace(".", "").TrimEnd(new char[] { '-', ',', '_' });
            return outputString;
        }

        public string DropDownDatesFormat(string val)
        {
            string _value = "";
            // Commented try catch by Vishal Tyagi as
            //Purpose: As per Implementation of Global Exception in HandleException attribute, No need to handle try catch here.  
            //try
            //{
            if (val.Length > 0)
            {
                if (Convert.ToInt32(val) > 0 && Convert.ToInt32(val) < 10) { _value = "0" + val; }
                else if (Convert.ToInt32(val) >= 10) { _value = val; }
            }
            //}
            //catch (Exception ex) { ErrorSignal.FromCurrentContext().Raise(ex); _value = ""; }
            return _value;
        }

        public string FormatedLocationNames(string inputString)
        {
            string outputString = inputString.Trim();
            outputString = outputString.ToLower();
            outputString = outputString.Replace("    ", " ").Replace("   ", " ").Replace("  ", " ").Replace(" - ", "-").Replace("  -  ", "-").Replace(" ", "-").Replace("\\", "").Replace("/", "").Replace(":", "").Replace("*", "").Replace("?", "").Replace("\"", "").Replace("<", "").Replace(">", "").Replace("|", "").Replace(",", "").Replace("'", "").Replace(".", "").TrimEnd(new char[] { '-', ',', '_' });
            return outputString;
        }

        public string FormatBrowseFilterButtons(string inputString, string _param, string pagename)
        {
            string _val = string.Empty;
            string _url = Na.Core.Configuration.NaConfig.Url.DomainUrl;
            var _browseUrl = Request.RawUrl;
            if (_browseUrl.Contains("?")) { var _rawUrl = _browseUrl.Split('?'); if (_rawUrl != null) { _browseUrl = _rawUrl[0]; } }
            _param = _common.GetStringValue(_param, "");

            if (!String.IsNullOrWhiteSpace(pagename))
            {
                if (pagename == "location") { pagename = "browselocations"; }
                if (pagename == "date") { pagename = "browsedate"; }
                if (pagename == "article") { pagename = "browsearticles"; }
            }

            if (!String.IsNullOrWhiteSpace(_param))
            {
                //if (_param == "co") { if (pagename == "browselocations") { _url += "/" + pagename; } else { _url += _browseUrl + "?rvfield=co"; } }
                //if (_param == "st") { if (pagename == "browselocations") { _url += "/" + _common.GetStringValue(_countryAbbr, "us"); } else { _url += _browseUrl + "?rvfield=st"; } }
                //if (_param == "ct") { if (pagename == "browselocations") { _url += "/" + _common.GetStringValue(_countryAbbr, "us") + "/" + _common.GetStringValue(_stateName, "").Replace(" ", "-"); } else { _url += _browseUrl + "?rvfield=ct"; } }

                if (_param == "co")
                {
                    if (pagename == "browselocations") { _url += "/" + pagename; }
                    //else if (pagename == "browsearticles") { _url += "/" + pagename; }
                    else { _url += _browseUrl + "?rvfield=co"; }
                }
                if (_param == "st")
                {
                    if (pagename == "browselocations") { _url += "/" + _common.GetStringValue(_countryAbbr, "us"); }
                    // else if (pagename == "browsearticles") { _url += "/" + _common.GetStringValue(_countryAbbr, "us"); } 
                    else { _url += _browseUrl + "?rvfield=st"; }
                }
                if (_param == "ct")
                {
                    if (pagename == "browselocations") { _url += "/" + _common.GetStringValue(_countryAbbr, "us") + "/" + _common.GetStringValue(_stateName, "").Replace(" ", "-"); }
                    // else if (pagename == "browsearticles") { _url += "/" + _common.GetStringValue(_countryAbbr, "us") + "/" + _common.GetStringValue(_stateName, "").Replace(" ", "-"); }
                    else { _url += _browseUrl + "?rvfield=ct"; }
                }
                if (_param == "ex" || _param == "by" || _param == "bd") { if (pagename == "browsedate") { _url += "/browsedate"; } else { _url += _browseUrl + "?rvfield=" + _param; } }

                if (_param == "ti") { if (pagename == "browsearticles") { _url += "/" + pagename; } else { _url += _browseUrl + "?rvfield=ti"; } }
            }
            if (!String.IsNullOrWhiteSpace(inputString))
            {
                // _val = "<a href=\"" + _url.ToLower() + "\" class=\"btn btn-mini\" >" + _common.GetStringValue(inputString, "") + "<i class=\"icon-remove\"></i></a> ";
                _val = "<li>" + _common.GetStringValue(inputString, "") + "&nbsp;<a href=\"" + _url.ToLower() + "/\" class=\"aRemove\" aria-label=\"" + _param + "\"><i data-original-title=\"Remove &ldquo;" + _common.GetStringValue(inputString, "") + "&rdquo;\" rel=\"tooltip\" class=\"icon-remove tooltipElement\"></i></a></li>";
            }
            return _val;
        }

        private string GetLastDayOfMonth(int iYear, int iMonth)
        {
            DateTime dtTo = new DateTime(iYear, iMonth, 1, 23, 59, 59);
            dtTo = dtTo.AddMonths(1);
            dtTo = dtTo.AddDays(-(dtTo.Day));
            return String.Format("{0:yyyy-MM-dd}", dtTo);
        }

        /// <summary>
        /// GetMonthName by month in number
        /// </summary>
        /// <param name="_month"></param>
        /// <returns></returns>
        private string GetMonthName(Int32 _month)
        {
            string _rtMonth = string.Empty;
            if (_month <= 0) { _rtMonth = string.Empty; }
            if (_month == 1) { _rtMonth = "January"; }
            if (_month == 2) { _rtMonth = "February"; }
            if (_month == 3) { _rtMonth = "March"; }
            if (_month == 4) { _rtMonth = "April"; }
            if (_month == 5) { _rtMonth = "May"; }
            if (_month == 6) { _rtMonth = "June"; }
            if (_month == 7) { _rtMonth = "July"; }
            if (_month == 8) { _rtMonth = "August"; }
            if (_month == 9) { _rtMonth = "September"; }
            if (_month == 10) { _rtMonth = "October"; }
            if (_month == 11) { _rtMonth = "November"; }
            if (_month == 12) { _rtMonth = "December"; }
            return _rtMonth;
        }

        private string GetPdfContent(int imageid, string htmlFilePath)
        {
            var _pdfpath = string.Empty;
            var _content = string.Empty;

            // Commented try catch by Vishal Tyagi as
            //Purpose: As per Implementation of Global Exception in HandleException attribute, No need to handle try catch here.  
            //try  
            //{
            if (htmlFilePath.EndsWith("\\"))
            {
                _pdfpath = Path.Combine(htmlFilePath, imageid.ToString() + "_clean.html");
            }
            if (System.IO.File.Exists(_pdfpath))
            {
                using (StreamReader htmlstream = new StreamReader(_pdfpath))
                {
                    _content = htmlstream.ReadToEnd();
                }
                _content = Regex.Replace(_content, @"</?[a-zA-Z0-9]*[^<>]*>", " ");
                _content = _content.Replace(Environment.NewLine, string.Empty);
            }
            //}
            //catch (Exception ex) { ErrorSignal.FromCurrentContext().Raise(ex); }
            return _content;
        }

        private bool CheckUrlForRediract(string url)
        {
            bool isExist = false;
            var lastchar = url.LastIndexOf("/");
            int totchar = url.Length;
            if ((lastchar + 1) < totchar && url.ToLower().IndexOf("page") < 0)
            {
                isExist = true;
            }
            return isExist;
        }

        private void GetMetaDataForFacebook(ref BrowseResultsModel model)
        {

            //-----------------------Added for Facebook Open Graph Variable Assign For MetaData--------------------
            string ApplicationKey = _config.GetStringValueFromConfig("FacebookAppKey", string.Empty);
            model.MetaKeyword = "";
            // int _totalRecord = (model.ResultsPageCount * model.pagingresults.PageNumber);
            ////string pageTitle = model.MetaTitle = "NewspaperARCHIVE.com : " + model.Title + ", " + model.FormattedPubDate + ", Page " + model.PageNumber;
            //  string pageTitle = model.MetaTitle = model.Title + ", " + model.FormattedPubDate + ", Page " + model.PageNumber;
            string FBpageTitle = string.Empty;
            if (!String.IsNullOrWhiteSpace(model.Location.CountryName) && !String.IsNullOrWhiteSpace(model.Location.StateName) && !String.IsNullOrWhiteSpace(model.Location.CityName))
            {
                FBpageTitle = model.Location.CountryName + ", " + model.Location.StateName + ", " + model.Location.CityName + ", Page " + model.Page;
            }
            else if (!String.IsNullOrWhiteSpace(model.Location.CountryName) && !String.IsNullOrWhiteSpace(model.Location.StateName))
            {
                FBpageTitle = model.Location.CountryName + ", " + model.Location.StateName + ", Page " + model.Page;
            }
            else
            {
                FBpageTitle = model.Location.CountryName + ", Page " + model.Page;
            }

            string pageKeyword = model.MetaKeyword = "newspaper archives, newspaper articles, newspapers, genealogy, historic articles, obituaries, local newspapers, newspaper obituaries, this day in history,family tree";
            /////string metaDescription = model.MetaDescription = "If you are interested in reading Page " + model.PageNumber + ", " + model.Title + ", " + model.FormattedPubDate + ", then NewspaperARCHIVE is the best tool to get the job done. NewspaperARCHIVE is the world's largest online newspaper archive and features a news search technology that will deliver accurate information quickly. Whether you simply want to browse a newspaper published in 1609 or want to read Page " + model.PageNumber + " of " + model.Title + " from " + model.FormattedPubDate + ", a NewspaperARCHIVE news search will deliver the accurate results you need.";
            // string metaDescription = model.MetaDescription = "If you are interested in reading Page " + model.PageNumber + ", " + model.Title + ", " + model.FormattedPubDate + ", then NewspaperARCHIVE is the best tool to get the job done. ";
            string pageURL = Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction;
            string canonicalURL = Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + model.Page;

            if (model.Page == 1)
            {
                ////model.MetaTitle = pageTitle = "NewspaperARCHIVE.com : " + model.Title + ", " + model.FormattedPubDate + " : Front Page";
                //  model.MetaTitle = pageTitle = model.Title + ", " + model.FormattedPubDate + " : Front Page";
                //FBpageTitle = model.Title + ", " + model.FormattedPubDate + ", Page 1";
                //model.MetaDescription = metaDescription = "Check out Page 1 of " + model.Title + " from " + model.FormattedPubDate + ".  NewspaperARCHIVE is the largest online newspaper archive with over 120 Million newspapers dating all the way back to 1609. No matter if you just want to see the front page of " + model.Title + ", " + model.FormattedPubDate + " or read the entire story, NewspaperARCHIVE is the best tool for the job.";
                // model.MetaDescription  = "Check out Page 1 of " + model.Title + " from " + model.FormattedPubDate + ".";
                pageURL = Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "/";

                model.MetaProperties = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "/" + "\" />";
                if (model.TotalBrowseresultCount > 15)
                    model.MetaProperties += "<link rel=\"next\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + 2 + "\" />";
            }
            else if (model.Page == 2)
            {
                //As requirement from Beatriz Gomez on 23 september 2013 and added by Raju Sahoo
                model.MetaProperties = "<link rel=\"canonical\" href=\"" + canonicalURL + "\" />";

                model.MetaProperties += "<link rel=\"prev\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "/" + "\" />";
                model.MetaProperties += "<link rel=\"next\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + _common.GetStringValue(model.pagingresults.PageNumber + 1, string.Empty) + "\" />";
            }
            else if (model.Page > 2)
            {
                model.MetaProperties = "<link rel=\"canonical\" href=\"" + canonicalURL + "\" />";

                model.MetaProperties += "<link rel=\"prev\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + _common.GetStringValue(model.pagingresults.PageNumber - 1, string.Empty) + "\" />";
                model.MetaProperties += "<link rel=\"next\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + _common.GetStringValue(model.pagingresults.PageNumber + 1, string.Empty) + "\" />";
            }
            else
            {
                model.MetaProperties = "<link rel=\"canonical\" href=\"" + canonicalURL + "\" />";
                model.MetaProperties += "<link rel=\"prev\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + model.MyControlAction + "?Page=" + _common.GetStringValue(model.pagingresults.PageNumber - 1, string.Empty) + "\" />";
            }

            //-----------------------Added for Facebook Open Graph Start Dated on:18-02-2012--------------------
            string FBDescription = "NewspaperARCHIVE is the world's largest newspaper archive. Check out " + model.Title + " and 5000+ other newspapers spanning over 400 Years. A great tool for genealogy research.";
            //DateTime pubdatetime = Convert.ToDateTime(pubDate);
            // string published_time = Convert.ToDateTime(model.PubDate).ToString("yyyy-MM-dd"); //Convert.ToString(objBasePage.ConvertToUnixTimestamp(pubdatetime));         

            /////string Thumb = Na.Core.Configuration.NaConfig.Url.DomainUrl + "/ThumbImage.ashx?i=" + model.ImageID;
            //  string Thumb = Na.Core.Configuration.NaConfig.Url.DomainUrl + model.SeoTitle + "/" + model.PubDate + "/" + model.ImageID + "-thumbnail.jpg";
            model.HeadPrefix = "prefix=\"og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#\"";
            model.MetaProperties += "<meta property=\"fb:app_id\" content=\"" + ApplicationKey + "\"/>";
            model.MetaProperties += "<meta property=\"og:type\" content=\"article\"/>";
            model.MetaProperties += "<meta property=\"og:url\" content=\"" + pageURL + "\"/>";
            model.MetaProperties += "<meta property=\"og:title\" content=\"" + FBpageTitle + "\"/>";
            FBDescription = "";
            model.MetaProperties += "<meta property=\"og:description\" content=\"" + FBDescription + "\"/>";
            // model.MetaProperties += "<meta property=\"og:image\" content=\"" + Thumb + "\"/>";
            // model.MetaProperties += "<meta property=\"og:title\" content=\"" + model.Title + "\"/>";
            // model.MetaProperties += "<meta property=\"article:published_time\" content=\"" + published_time + "\"/>";
            model.MetaProperties += "<meta property=\"fb:admins\" content=\"1346799799\"/>";
            //-----------------------Added By for Facebook Open Graph End Dated on:18-02-2012--------------------

            ////model.MetaProperties = "<meta name=\"description\" content=\"" + model.MetaDescription + "\" />" + model.MetaProperties;
        }

        #endregion

        #region New Browse
        /// <summary>
        /// This is get way method for get all related method for new  browse result.
        /// </summary>
        /// <param name="model"></param>
        /// <param name="pagename"></param>
        private void GetBrowseResults(ref  BrowseResultsModel model, string pagename)
        {
            model.Location = new LocationModels();
            model.Dates = new DateModels();
            SetBrowseCookieGet(ref model, pagename);
            LocationDropDownPopulate(ref model);

            #region Browse Results Populate
            GetResultDetails(ref model);
            #endregion
        }
        /// <summary>
        /// Fetch result from data base 
        /// </summary>
        /// <param name="model"></param>
        private void GetResultDetails(ref BrowseResultsModel model)
        {
            string _browseresult = string.Empty;
            switch (model.BrowseType)
            {
                //usa time zone year/day/month
                case (int)BrowserType.PublicationByDate:
                    model.NewBrowseLocationResult = _BrowseDataService.GetNewBrowseLocationResult(0, 0, 0, _common.GetIntegerValue(model.PubId, 0), _common.GetIntegerValue(model.PubYear, 0));
                    model.NewBrowseresultList = model.NewBrowseLocationResult.BrowseNewLocationData;
                    if (model.NewBrowseresultList.Count > 0)
                    {
                        GetBrowsHeadreFormatedtext(ref model);
                        if (model.NewBrowseLocationResult.ImageDetail != null)
                            model.ImageIdPath = model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.cityName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.pubTitleURL.ToLower().Replace(" ", "-") + "/" + model.NewBrowseLocationResult.ImageDetail.imageID + "-thumbnail.jpg";
                        _browseresult = "<div class=\"newLocUSListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">Browse " + model.NewBrowserresult.pubTitle + "&nbsp;" + model.NewBrowserresult.MaxPubdateYear + " Issues </h2>";
                        _browseresult = _browseresult + DisplayFormatedResult(ref model, 6);
                        _browseresult = _browseresult + "</div>";
                    }
                    else
                    {
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                        model.Browseresult = _browseresult;
                    }
                    break;
                case (int)BrowserType.PublicationByYear:
                    model.NewBrowseLocationResult = _BrowseDataService.GetNewBrowseLocationResult(0, 0, 0, _common.GetIntegerValue(model.PubId, 0), 0);
                    model.NewBrowseresultList = model.NewBrowseLocationResult.BrowseNewLocationData;
                    if (model.NewBrowseresultList.Count > 0)
                    {
                        GetBrowsHeadreFormatedtext(ref model);
                        if (model.NewBrowseLocationResult.ImageDetail != null)
                            model.ImageIdPath = model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.cityName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.pubTitleURL.ToLower().Replace(" ", "-") + "/" + model.NewBrowseLocationResult.ImageDetail.imageID + "-thumbnail.jpg";
                        _browseresult = "<div class=\"newLocUSListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">Browse " + model.BrowseBy + " Issues by Year</h2>";
                        _browseresult = _browseresult + DisplayFormatedResult(ref model, 6);
                        _browseresult = _browseresult + "</div>";
                    }
                    else
                    {
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                        model.Browseresult = _browseresult;
                    }
                    break;
                case (int)BrowserType.PublicationTitle:
                    model.NewBrowseresultList = _BrowseDataService.GetNewBrowseLocationData(_common.GetIntegerValue(model.countryId, 0), _common.GetIntegerValue(model.stateId, 0), _common.GetIntegerValue(model.cityId, 0), 0, 0);
                    if (model.NewBrowseresultList.Count > 0)
                    {
                        GetBrowsHeadreFormatedtext(ref model);
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">Explore " + model.HeaderNameText + "&nbsp;Historical Newspapers Archives</h2>";
                        _browseresult = _browseresult + DisplayFormatedResult(ref model, 2);
                        _browseresult = _browseresult + "</div>";
                    }
                    else
                    {
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                        model.Browseresult = _browseresult;
                    }
                    break;
                case (int)BrowserType.City:
                    model.NewBrowseresultList = _BrowseDataService.GetNewBrowseLocationData(_common.GetIntegerValue(model.countryId, 0), _common.GetIntegerValue(model.stateId, 0), 0, 0, 0);
                    if (model.NewBrowseresultList.Count > 0)
                    {
                        GetBrowsHeadreFormatedtext(ref model);
                        if (string.IsNullOrEmpty(model.Location.CityID) && !string.IsNullOrEmpty(model.Location.CityName))
                        {
                            _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                            _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                            model.Browseresult = _browseresult;
                        }
                        else
                        {
                            _browseresult = "<div class=\"newLocUSListArea\">";
                            _browseresult = _browseresult + "<h2 class=\"browseheading\">Explore " + model.BrowseBy + "&nbsp;Historical Newspapers by City</h2>";
                            _browseresult = _browseresult + DisplayFormatedResult(ref model, 6);
                            _browseresult = _browseresult + "</div>";
                        }
                    }
                    else
                    {
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                        model.Browseresult = _browseresult;
                    }
                    break;
                case (int)BrowserType.State:
                    model.NewBrowseresultList = _BrowseDataService.GetNewBrowseLocationData(_common.GetIntegerValue(model.countryId, 7), 0, 0, 0, 0);
                    if (model.NewBrowseresultList.Count > 0)
                    {
                        GetBrowsHeadreFormatedtext(ref model);
                        // check if stateid / cityid doesnot exist then no result found will come added by rachna/SA
                        if (string.IsNullOrEmpty(model.Location.StateID) && !string.IsNullOrEmpty(model.Location.StateName))
                        {
                            _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                            _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                            model.Browseresult = _browseresult;
                        }
                        else
                        {
                            _browseresult = "<div class=\"newLocUSListArea\">";
                            _browseresult = _browseresult + "<h2 class=\"browseheading\">Explore " + model.BrowseBy + " Historical Newspaper Archives by State</h2>";
                            _browseresult = _browseresult + DisplayFormatedResult(ref model, 6);
                            _browseresult = _browseresult + "</div>";
                        }
                    }
                    else
                    {
                        _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                        _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                        model.Browseresult = _browseresult;
                    }
                    break;
                default:
                    _browseresult = "<div class=\"newLocUSListArea newLocCityListArea\">";
                    _browseresult = _browseresult + "<h2 class=\"browseheading\">No result found</h2></div>";
                    model.Browseresult = _browseresult;
                    break;
            }
            if (!string.IsNullOrEmpty(_browseresult)) { model.Browseresult = _browseresult; }
        }
        /// <summary>
        /// Display result in number of column formated in heare 
        /// </summary>
        /// <param name="model"></param>
        /// <param name="numberofcolumn"></param>
        /// <returns></returns>
        private string DisplayFormatedResult(ref BrowseResultsModel model, int numberofcolumn)
        {
            string _browseresult = string.Empty;
            int _TotalResult = 0;
            int datapercolumn = 0;
            int remaningdata = 0;
            int count = 0;
            if (model.NewBrowseresultList.Count > 0)
            {
                _TotalResult = model.NewBrowseresultList.Count;
                if (_TotalResult > numberofcolumn)
                {
                    if ((_TotalResult % numberofcolumn) > 0 && numberofcolumn > 2) { numberofcolumn = numberofcolumn - 1; }
                    datapercolumn = (_TotalResult / numberofcolumn);
                    if (numberofcolumn == 2)
                    {
                        remaningdata = (_TotalResult % numberofcolumn);
                        datapercolumn = datapercolumn + remaningdata;
                    }
                    _browseresult = _browseresult + "<ul><li><ul>";
                    foreach (var R in model.NewBrowseresultList)
                    {
                        R.countryAbbr = !string.IsNullOrWhiteSpace(R.countryAbbr) ? R.countryAbbr.ToLower().Trim() : ""; // added by rachna/SA w.rt 407 SA should be sa
                        if (count > datapercolumn) { _browseresult = _browseresult + "</ul></li><li><ul>"; count = 0; }
                        switch (model.BrowseType)
                        {
                            case (int)BrowserType.PublicationByDate:
                                DateTime dt = _common.GetDateTimeValue(R.pubDate);
                                _browseresult = _browseresult + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" +
                                 R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" +
                                 R.pubTitleURL.Trim() + "/" + R.MaxPubdateYear + "/" + R.pubdatemonth.Trim() + "-" + R.pubdateday.Trim() + "/\" title=\"" + String.Format("{0:M-d-yyyy}", dt) + "\">" + String.Format("{0:M-d-yyyy}", dt) + "</a></li>";
                                break;
                            case (int)BrowserType.PublicationByYear:
                                _browseresult = _browseresult + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.pubTitleURL.Trim() + "/" + R.MaxPubdateYear + "/\" title=\"" + R.MaxPubdateYear + "\">" + R.MaxPubdateYear + "</a></li>";
                                break;
                            case (int)BrowserType.PublicationTitle:
                                _browseresult = _browseresult + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.pubTitleURL.Trim() + "/\" title=\"" + R.pubTitle + " Newspaper\">" + R.pubTitle + "</a>&nbsp;(" + R.MinPubdateYear + "-" + R.MaxPubdateYear + ")</li>";
                                break;
                            case (int)BrowserType.City:
                                _browseresult = _browseresult + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/\" title=\"" + R.cityName + " Newspaper Archives\">" + R.cityName + "</a></li>";
                                break;
                            case (int)BrowserType.State:
                                _browseresult = _browseresult + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Replace(".", "") + "/\" title=\"" + R.stateName + " Newspaper Archives\">" + R.stateName + "</a></li>";
                                break;
                        }
                        count++;
                    }
                    _browseresult = _browseresult + "</ul></li></ul>";
                }
                else
                {
                    _browseresult = _browseresult + "<ul>";
                    foreach (var R in model.NewBrowseresultList)
                    {
                        R.countryAbbr = !string.IsNullOrWhiteSpace(R.countryAbbr) ? R.countryAbbr.ToLower().Trim() : ""; // added by rachna/SA w.rt 407 SA should be sa
                        switch (model.BrowseType)
                        {
                            case (int)BrowserType.PublicationByDate:
                                DateTime dt = _common.GetDateTimeValue(R.pubDate);
                                _browseresult = _browseresult + "<li><ul><li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" +
                                 R.countryAbbr.Trim() + "/" + R.stateName.ToLower().Replace(" ", "-").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Trim() + "/" +
                                 R.pubTitleURL.Trim() + "/" + R.MaxPubdateYear + "/" + R.pubdatemonth.Trim() + "-" + R.pubdateday.Trim() + "/\" title=\"" + String.Format("{0:M-d-yyyy}", dt) + "\">" + String.Format("{0:M-d-yyyy}", dt) + "</a></li></ul></li>";
                                break;
                            case (int)BrowserType.PublicationByYear:
                                _browseresult = _browseresult + "<li><ul><li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + (R.countryAbbr ?? "").Trim().ToLower() + "/" + R.stateName.ToLower().Replace(" ", "-").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Trim() + "/" + R.pubTitleURL.Trim() + "/" + R.MaxPubdateYear + "/\" title=\"" + R.MaxPubdateYear + "\">" + R.MaxPubdateYear + "</a></li></ul></li>";
                                break;
                            case (int)BrowserType.PublicationTitle:
                                _browseresult = _browseresult + "<li><ul><li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + (R.countryAbbr ?? "").Trim().ToLower() + "/" + R.stateName.ToLower().Replace(" ", "-").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Trim() + "/" + R.pubTitleURL.Trim() + "/\" title=\"" + R.pubTitle + " Newspaper\">" + R.pubTitle + "</a>&nbsp;(" + R.MinPubdateYear + "-" + R.MaxPubdateYear + ")</li></ul></li>";
                                break;
                            case (int)BrowserType.City:
                                _browseresult = _browseresult + "<li><ul><li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + (R.countryAbbr ?? "").Trim().ToLower() + "/" + R.stateName.ToLower().Replace(" ", "-").Trim() + "/" + R.cityName.ToLower().Replace(" ", "-").Trim() + "/\" title=\"" + R.cityName + " Newspaper Archives\">" + R.cityName + "</a></li></ul></li>";
                                break;
                            case (int)BrowserType.State:
                                _browseresult = _browseresult + "<li><ul><li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + (R.countryAbbr ?? "").Trim().ToLower() + "/" + R.stateName.ToLower().Replace(" ", "-") + "/\" title=\"" + R.stateName + " Newspaper Archives\">" + R.stateName + "</a></li></ul></li>";
                                break;
                        }
                    }
                    _browseresult = _browseresult + "</ul>";
                }
            }
            return _browseresult;
        }
        /// <summary>
        /// Set cookies value //I have implemented for feture 'not need for new browser
        /// </summary>
        /// <param name="model"></param>
        /// <param name="_browsePage"></param>
        private void SetBrowseCookieGet(ref  BrowseResultsModel model, string _browsePage)
        {
            HttpCookie hcBrowse = null;
            if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
            {
                hcBrowse = Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"];
            }
            if ((Response.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null))
            {
                Response.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
            }
            #region BrowseLocation Fields

            _countryAbbr = _common.GetQueryStringValue("country", "");
            _stateName = _common.GetQueryStringValue("state", "");
            _cityName = _common.GetQueryStringValue("city", "");
            _titleName = _common.GetQueryStringValue("pubTitle", "");
            _pubyear = _common.GetQueryStringValue("year", "");

            if (!String.IsNullOrWhiteSpace(_countryAbbr)) { _countryAbbr = _countryAbbr.Replace("/", ""); model.Location.CountryAbbr = _countryAbbr; model.MapLocationName = string.Empty; model.MapLocationName = _countryAbbr; }
            if (!String.IsNullOrWhiteSpace(_stateName)) { _stateName = _stateName.Replace("/", ""); model.Location.StateName = _stateName; model.MapLocationName = string.Empty; model.MapLocationName = _stateName; }
            if (!String.IsNullOrWhiteSpace(_cityName)) { _cityName = _cityName.Replace("/", ""); model.Location.CityName = _cityName; model.MapLocationName = string.Empty; model.MapLocationName = _cityName; }
            if (!String.IsNullOrWhiteSpace(_titleName)) { _titleName = _titleName.Replace("/", ""); model.Location.PublicationTitle = _titleName; }
            if (!String.IsNullOrWhiteSpace(_pubyear)) { _pubyear = _pubyear.Replace("/", ""); model.PubYear = _pubyear; }


            if (_browsePage == "location")
            {
                if (!String.IsNullOrWhiteSpace(_countryAbbr) || !String.IsNullOrWhiteSpace(_stateName) || !String.IsNullOrWhiteSpace(_cityName))
                {
                    var _locations = _countryService.GetLocationIdsByNames(_countryAbbr, _stateName, _cityName).SingleOrDefault();
                    if (_locations != null)
                    {
                        _countryId = model.countryId = _common.GetStringValue(_locations.countryid, "");
                        _stateId = model.stateId = _common.GetStringValue(_locations.stateid, "");
                        _cityId = model.cityId = _common.GetStringValue(_locations.cityid, "");
                    }
                    _locations = null;
                }
            }
            else if (_browsePage == "publication")
            {
                var _locations = _browserResultDetail.GetLocationIdsByPubTitle(_titleName).SingleOrDefault();
                if (_locations != null)
                {
                    _countryId = model.countryId = _common.GetStringValue(_locations.countryid, "");
                    _stateId = model.stateId = _common.GetStringValue(_locations.stateid, "");
                    _cityId = model.cityId = _common.GetStringValue(_locations.cityid, "");
                    _pubId = model.PubId = _common.GetStringValue(_locations.pubId, "");
                }
                _locations = null;
            }


            //else
            //{
            //    if (hcBrowse != null)
            //    {
            //        _countryId = _common.GetStringValue(hcBrowse.Values["countryid"], "0");
            //        _stateId = _common.GetStringValue(hcBrowse.Values["stateid"], "0");
            //        _cityId = _common.GetStringValue(hcBrowse.Values["cityid"], "0");
            //    }
            //}
            #endregion

            #region BrowseDate Fields
            //if (_browsePage == "date")
            //{
            //    _startyear = _common.GetQueryStringValue("yr", "");
            //    _startmonth = _common.GetQueryStringValue("mn", "");
            //    _startday = _common.GetQueryStringValue("dy", "");
            //    _endyear = _common.GetQueryStringValue("eyr", "");
            //    _endmonth = _common.GetQueryStringValue("emn", "");
            //    _endday = _common.GetQueryStringValue("edy", "");

            //    if (!String.IsNullOrWhiteSpace(_startyear)) { _startyear = _startyear.Replace("/", ""); }
            //    if (!String.IsNullOrWhiteSpace(_startmonth)) { _startmonth = _startmonth.Replace("/", ""); }
            //    if (!String.IsNullOrWhiteSpace(_startday)) { _startday = _startday.Replace("/", ""); }
            //    if (!String.IsNullOrWhiteSpace(_endyear)) { _endyear = _endyear.Replace("/", ""); }
            //    if (!String.IsNullOrWhiteSpace(_endmonth)) { _endmonth = _endmonth.Replace("/", ""); }
            //    if (!String.IsNullOrWhiteSpace(_endday)) { _endday = _endday.Replace("/", ""); }

            //    if (!String.IsNullOrWhiteSpace(_startyear) && String.IsNullOrWhiteSpace(_startmonth) && String.IsNullOrWhiteSpace(_startday) && String.IsNullOrWhiteSpace(_endyear) && String.IsNullOrWhiteSpace(_endmonth) && String.IsNullOrWhiteSpace(_endday)) { _endyear = _startyear; }
            //}
            //else
            //{
            //    if (hcBrowse != null)
            //    {
            //        _startyear = _common.GetStringValue(hcBrowse.Values["year"], "");
            //        _startmonth = _common.GetStringValue(hcBrowse.Values["month"], "");
            //        _startday = _common.GetStringValue(hcBrowse.Values["day"], "");
            //        _endyear = _common.GetStringValue(hcBrowse.Values["endyear"], "");
            //        _endmonth = _common.GetStringValue(hcBrowse.Values["endmonth"], "");
            //        _endday = _common.GetStringValue(hcBrowse.Values["endday"], "");
            //    }
            //}
            //#endregion

            //#region BrowseArticle Field
            //if (_browsePage == "article") { _titleInitial = _common.GetQueryStringValue("a", ""); if (!String.IsNullOrWhiteSpace(_titleInitial)) { _titleInitial = _titleInitial.Replace("/", ""); } }
            //else { if (hcBrowse != null) { _titleInitial = _common.GetStringValue(hcBrowse.Values["titleinitial"], ""); } }
            #endregion

            if (_common.GetIntegerValue(model.countryId, 0) > 0 && _common.GetIntegerValue(model.stateId, 0) > 0 && _common.GetIntegerValue(model.cityId, 0) > 0 && _common.GetIntegerValue(model.PubId, 0) > 0 && _common.GetIntegerValue(model.PubYear, 0) > 0)
            { model.BrowseType = (int)BrowserType.PublicationByDate; }
            else if (_common.GetIntegerValue(model.countryId, 0) > 0 && _common.GetIntegerValue(model.stateId, 0) > 0 && _common.GetIntegerValue(model.cityId, 0) > 0 && _common.GetIntegerValue(model.PubId, 0) > 0)
            { model.BrowseType = (int)BrowserType.PublicationByYear; }
            else if (_common.GetIntegerValue(model.countryId, 0) > 0 && _common.GetIntegerValue(model.stateId, 0) > 0 && _common.GetIntegerValue(model.cityId, 0) > 0)
            { model.BrowseType = (int)BrowserType.PublicationTitle; }
            else if (_common.GetIntegerValue(model.countryId, 0) > 0 && _common.GetIntegerValue(model.stateId, 0) > 0)
            { model.BrowseType = (int)BrowserType.City; }
            else if (_common.GetIntegerValue(model.countryId, 0) > 0)
            { model.BrowseType = (int)BrowserType.State; }

            #region BrowseLocation Cookie Check and Reset
            if (hcBrowse != null)
            {
                var _recordsPerPage = _common.GetIntegerValue(hcBrowse.Values["resultsperpage"], 0);
                if (_recordsPerPage > 0) { model.ResultsPageCount = _recordsPerPage; } else { model.ResultsPageCount = 15; }
                if ((Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"] != null && Request.Cookies[_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation"].HasKeys))
                {
                    Request.Cookies.Remove(_config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com") + ".BrowseLocation");
                }
            }

            Response.Cookies.Add(_clsCookie.fcnCreateBrowseLocationsCookie(
                _common.GetStringValue(_countryId, "0"),
                _common.GetStringValue(_stateId, "0"),
                _common.GetStringValue(_cityId, "0"),
                _common.GetStringValue(_pubId, "0"),
                _common.GetStringValue(_startyear, ""),
                _common.GetStringValue(_startmonth, ""),
                _common.GetStringValue(_startday, ""),
                _common.GetStringValue(_endyear, ""),
                _common.GetStringValue(_endmonth, ""),
                _common.GetStringValue(_endday, ""),
                _common.GetStringValue(_titleInitial, ""), "", "", "",
                _config.GetStringValueFromConfig("cookieTimeout", "100"), _config.GetStringValueFromConfig("cookiePrefix", "NewspaperARCHIVE.com"),
                _common.GetStringValue(model.ResultsPageCount, "15")
               ));

            #endregion
        }
        /// <summary>
        /// Display formated text(like "united states of america" to US )are set in model
        /// </summary>
        /// <param name="model"></param>
        private void GetBrowsHeadreFormatedtext(ref BrowseResultsModel model)
        {
            string ShortCountryName = string.Empty;
            model.CanonicalTag = string.Empty;

            string MaxYear = (from R in model.NewBrowseresultList select (R.MaxPubdateYear)).Max();
            string MinYear = (from R in model.NewBrowseresultList select (R.MinPubdateYear)).Min();
            if (MaxYear == MinYear) { model.YearRange = "(" + MaxYear + ")"; }
            else { model.YearRange = "(" + MinYear + " - " + MaxYear + ")"; }
            if (model.NewBrowseresultList.Count > 0) { model.NewBrowserresult = model.NewBrowseresultList.FirstOrDefault(); }

            if (!String.IsNullOrEmpty(model.NewBrowserresult.countryAbbr))
            {
                if (model.NewBrowserresult.countryAbbr.ToLower().Trim() == "us")
                {
                    model.NewBrowserresult.countryName = "United States"; ShortCountryName = "U.S.";
                }
                else if (model.NewBrowserresult.countryAbbr.ToLower().Trim() == "uk")
                {
                    ShortCountryName = "U.K.";
                }
                else
                {
                    ShortCountryName = model.NewBrowserresult.countryName;
                    model.LocationMapIconCss = "newLocMapSearchArea" + model.NewBrowserresult.countryName;
                }
            }
            //Response.Write(model.BrowseType + "");
            //Response.End();
            switch (model.BrowseType)
            {
                case (int)BrowserType.PublicationByDate:
                    model.BrowseBy = model.NewBrowserresult.pubTitle;
                    model.HeaderNameText = model.NewBrowserresult.pubTitle;
                    model.DescriptionTag = HttpUtility.HtmlDecode("Discover local news articles and your ancestors&#8217; genealogy records from " + model.NewBrowserresult.MaxPubdateYear + " in our " + model.NewBrowserresult.pubTitle + " newspaper archives.");
                    model.CanonicalTag = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.NewBrowserresult.stateName.Replace(" ", "-").ToLower() + "/" + model.NewBrowserresult.cityName.Replace(" ", "-").ToLower() + "/" + model.NewBrowserresult.pubTitle.Replace(" ", "-").ToLower() + "/" + model.NewBrowseresultList.Max(c => c.MaxPubdateYear) + "/\" />";
                    model.forSeoTitle = model.NewBrowserresult.pubTitle;
                    model.HeaderLocationText = "<span>" + model.NewBrowserresult.cityName + ", " + model.NewBrowserresult.stateName + "</span>";
                    model.SearchHeaderText = "<h2>Search All <span>" + model.BrowseBy + " Newspapers</span></h2>";
                    model.YearRange = "(" + model.NewBrowseresultList.Max(c => c.MaxPubdateYear) + ")";
                    model.UnderBrowseMapAreaMessage = "<h2>Explore Historic <span>" + model.NewBrowserresult.MaxPubdateYear + " " + model.NewBrowserresult.pubTitle + " </span>Newspapers from the World's Leading Online Newspaper Resource!</h2>";
                    break;
                case (int)BrowserType.PublicationByYear:
                    model.BrowseBy = model.NewBrowserresult.pubTitle;
                    model.HeaderNameText = model.NewBrowserresult.pubTitle;
                    model.DescriptionTag = HttpUtility.HtmlDecode("Discover " + model.NewBrowserresult.cityName + " local news articles and your ancestors&#8217; genealogy records in our " + model.NewBrowserresult.pubTitle + " newspaper archives from " + model.YearRange.Replace("-", "to").Replace("(", "").Replace(")", "") + ".");
                    model.CanonicalTag = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.NewBrowserresult.stateName.Replace(" ", "-").ToLower() + "/" + model.NewBrowserresult.cityName.Replace(" ", "-").ToLower() + "/" + model.NewBrowserresult.pubTitle.Replace(" ", "-").ToLower() + "/\" />";
                    model.HeaderLocationText = "<span>" + model.NewBrowserresult.cityName + ", " + model.NewBrowserresult.stateName + "</span>";
                    model.forSeoTitle = model.NewBrowserresult.pubTitle;
                    model.SearchHeaderText = "<h2>Search All <span>" + model.BrowseBy + " Newspapers</span></h2>";
                    model.UnderBrowseMapAreaMessage = "<h2>Explore Historic <span>" + model.NewBrowserresult.pubTitle + " </span>Newspapers from the World's Leading Online Newspaper Resource!</h2>";
                    break;
                case (int)BrowserType.PublicationTitle:
                    SetLocationMap(ref model);//for display map 
                    model.BrowseBy = model.NewBrowserresult.cityName;
                    model.BrowseMapAreaHeaderText = "<h2>Browse " + model.BrowseBy + " Newspaper Archives</h2>";
                    model.DescriptionTag = HttpUtility.HtmlDecode("Discover your family tree, ancestors&#8217; and historical events with our massive collection of local " + model.BrowseBy + " newspaper archives at NewspaperArchive.com");
                    model.CanonicalTag = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.NewBrowserresult.stateName.Replace(" ", "-").ToLower() + "/" + model.BrowseBy.Replace(" ", "-").ToLower() + "/\" />";
                    model.forSeoTitle = model.BrowseBy;
                    model.HeaderNameText = model.NewBrowserresult.cityName + ", " + model.NewBrowserresult.stateName;
                    model.SearchHeaderText = "<h2>Search All <span>" + model.BrowseBy + " Newspapers</span></h2>";
                    model.UnderBrowseMapAreaMessage = "&nbsp;&nbsp";
                    break;
                case (int)BrowserType.City:
                    SetLocationMap(ref model);//for display map 
                    model.BrowseBy = model.NewBrowserresult.stateName;
                    model.HeaderNameText = model.NewBrowserresult.stateName;
                    model.BrowseMapAreaHeaderText = "<h2>Browse " + model.BrowseBy + " Newspaper Archives</h2>";
                    model.DescriptionTag = "Discover " + model.BrowseBy + " historical and genealogical newspaper archives from " + model.YearRange.Replace("-", "to").Replace("(", "").Replace(")", "") + " with our massive collection of more than 130 million old newspaper articles!";
                    model.CanonicalTag = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.BrowseBy.Replace(" ", "-").ToLower() + "/\" />";
                    model.forSeoTitle = model.BrowseBy;
                    model.SearchHeaderText = "<h2>Search All <span>" + model.BrowseBy + " Newspapers</span></h2>";
                    model.UnderBrowseMapAreaMessage = "Browse " + model.BrowseBy + " newspaper articles from a specific city";
                    break;
                case (int)BrowserType.State:
                    SetLocationMap(ref model);//for display map 
                    model.BrowseBy = model.NewBrowserresult.countryName;
                    model.HeaderNameText = model.NewBrowserresult.countryName;
                    model.BrowseMapAreaHeaderText = "<h2>Browse " + ShortCountryName + " Newspaper Archives</h2>";
                    model.DescriptionTag = "Discover " + ShortCountryName + " historical and genealogical newspaper archives from " + model.YearRange.Replace("-", "to").Replace("(", "").Replace(")", "") + " with our massive collection of more than 130 million old newspaper articles!";
                    model.CanonicalTag = "<link rel=\"canonical\" href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/\" />";
                    model.forSeoTitle = model.BrowseBy;
                    model.SearchHeaderText = "<h2>Search All <span>" + model.BrowseBy + " Newspapers</span></h2>";
                    model.UnderBrowseMapAreaMessage = "Browse " + model.BrowseBy + " newspaper articles from a specific state";
                    break;
            }
        }
        /// <summary>
        /// Browse breadcrumb (Header position )
        /// </summary>
        /// <param name="model"></param>
        private void GetBrowserLocationBreadcrumbButton(ref BrowseResultsModel model)
        {
            if (model.NewBrowseresultList != null && model.NewBrowseresultList.Count > 0)
            {
                if (!String.IsNullOrEmpty(model.NewBrowserresult.countryAbbr))
                {
                    if (model.NewBrowserresult.countryAbbr.ToLower().Trim() == "us" || model.NewBrowserresult.countryAbbr.ToLower().Trim() == "uk")
                    { model.NewBrowserresult.countryName = model.NewBrowserresult.countryAbbr.ToUpper().Trim(); }
                    else
                    {
                        // added by rachna/SA w.rt 407 SA should be sa
                        model.NewBrowserresult.countryAbbr = !string.IsNullOrWhiteSpace(model.NewBrowserresult.countryAbbr) ? model.NewBrowserresult.countryAbbr.ToLower().Trim() : "";
                    }
                }
                string breadcrumb = string.Empty;
                breadcrumb = "<div class=\"newBrc\">";
                breadcrumb = breadcrumb + "<ul>";
                breadcrumb = breadcrumb + "<li>You Are Here :</li>";
                breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "\">Home</a><span>&nbsp;></span></li>";
                switch (model.BrowseType)
                {
                    case (int)BrowserType.PublicationByDate:
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/\">" + model.NewBrowserresult.countryName + " Newspaper Archives</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.stateName + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.cityName.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.cityName + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/" +
                        model.NewBrowserresult.cityName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.pubTitleURL.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.pubTitle + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li>" + model.NewBrowserresult.MaxPubdateYear + "&nbsp;" + model.NewBrowserresult.pubTitle + "</li>";
                        break;
                    case (int)BrowserType.PublicationByYear:
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/\">" + model.NewBrowserresult.countryName + " Newspaper Archives</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.stateName + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/" + model.NewBrowserresult.cityName.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.cityName + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li>" + model.NewBrowserresult.pubTitle + "</li>";
                        break;
                    case (int)BrowserType.PublicationTitle:
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/\">" + model.NewBrowserresult.countryName + " Newspaper Archives</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-") + "/\">" + model.NewBrowserresult.stateName + "</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li>" + model.NewBrowserresult.cityName + "</li>";
                        break;
                    case (int)BrowserType.City:
                        breadcrumb = breadcrumb + "<li><a href=\"" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.Trim() + "/\">" + model.NewBrowserresult.countryName + " Newspaper Archives</a><span>&nbsp;></span></li>";
                        breadcrumb = breadcrumb + "<li>" + model.NewBrowserresult.stateName + "</li>";
                        break;
                    case (int)BrowserType.State:
                        breadcrumb = breadcrumb + "<li>" + model.NewBrowserresult.countryName + " Newspaper Archives</li>";
                        break;
                }
                breadcrumb = breadcrumb + "</ul>";
                breadcrumb = breadcrumb + "</div>";
                model.Bratcamp = breadcrumb;
            }
        }
        /// <summary>
        /// Location (country ,state,city,publication) population 
        /// </summary>
        /// <param name="model"></param>
        private void LocationDropDownPopulate(ref  BrowseResultsModel model)
        {

            #region Reset Location DropDowns from Location Filters
            //Country Dropdown
            model.Location.AvailableCountries.Clear();
            var allCountry = _weblocationpubtitlesService.GetAllCountries();
            if (allCountry != null)
                model.Location.AvailableCountries = allCountry.Select(c => new SelectListItem() { Text = c.countryName, Value = c.countryid.ToString() }).ToList();
            model.Location.CountryID = _common.GetStringValue(model.countryId, "0");

            //TempData["Country"] = model.Location.CountryID;
            //_countryName = model.Location.AvailableCountries.Where(p => p.Value == _countryId).ToList().Select(p => p.Text).FirstOrDefault();
            //if (!String.IsNullOrWhiteSpace(_countryName)) { model.Location.CountryName = _common.GetStringValue(_countryName, ""); }

            //State dropdown
            model.Location.AvailableStates.Clear();
            if (!string.IsNullOrWhiteSpace(model.Location.CountryID) && model.Location.CountryID != "0")
            {
                var statesByCountryId = _weblocationpubtitlesService.GetStatesByCountryId(_common.GetIntegerValue(model.Location.CountryID, 0));
                if (statesByCountryId != null)
                    model.Location.AvailableStates = statesByCountryId.Select(c => new SelectListItem() { Text = c.stateName, Value = c.stateid.ToString() }).ToList();
                model.Location.StateID = _common.GetStringValue(model.stateId, "0");
            }
            // model.Location.StateID = "14"; //_common.GetStringValue(model.stateId, "0");
            //TempData["State"] = model.Location.StateID;
            //_stateName = model.Location.AvailableStates.Where(p => p.Value == _stateId).ToList().Select(p => p.Text).FirstOrDefault();
            //if (!String.IsNullOrWhiteSpace(_stateName)) { model.Location.StateName = _common.GetStringValue(_stateName, ""); }

            //City dropdown
            model.Location.AvailableCities.Clear();
            if (!string.IsNullOrWhiteSpace(model.Location.StateID) && model.Location.StateID != "0")
            {
                var citiesByStateId = _weblocationpubtitlesService.GetCitiesByStateId(_common.GetIntegerValue(model.Location.StateID, 0));
                if (citiesByStateId != null)
                    model.Location.AvailableCities = citiesByStateId.Select(c => new SelectListItem() { Text = c.cityName, Value = c.cityid.ToString() }).ToList();
            }
            model.Location.CityID = _common.GetStringValue(model.cityId, "0");
            //TempData["City"] = model.Location.CityID;
            //_cityName = model.Location.AvailableCities.Where(p => p.Value == _cityId).ToList().Select(p => p.Text).FirstOrDefault();
            //if (!String.IsNullOrWhiteSpace(_cityName)) { model.Location.CityName = _common.GetStringValue(_cityName, ""); }

            //model.Location.IsPublicationLocation = true;
            //_pubId = _common.GetStringValue(model.Location.PublicationTitleID, "");

            //Title dropdown
            if (!string.IsNullOrWhiteSpace(model.Location.CityID) && model.Location.CityID != "0")
            {
                //var titlesWithYearByCityId = _weblocationpubtitlesService.GetTitlesWithYearByCityId(_common.GetIntegerValue(model.Location.CityID, 0));

                var titlesWithYearByCityId = _weblocationpubtitlesService.GetTitlesWithYearByCityIdAndStateId(_common.GetIntegerValue(model.Location.CityID, 0), _common.GetIntegerValue(model.Location.StateID, 0)).ToList();

                if (titlesWithYearByCityId != null)
                    model.Location.AvailablePubTitles = titlesWithYearByCityId.Select(c => new SelectListItem() { Text = c.pubTitle, Value = c.pubID.ToString() }).ToList();
                // model.Location.AvailablePubTitles = titlesWithYearByCityId.Select(c => new SelectListItem() { Text = c.pubTitle + " (" + c.minPubDateYear + " - " + c.maxPubDateYear + ")", Value = c.pubID.ToString() }).ToList();
            }
            model.Location.PublicationTitleID = _common.GetStringValue(model.PubId, "0");
            //TempData["Publication"] = model.Location.PublicationTitleID;
            //_titleName = model.Location.AvailablePubTitles.Where(p => p.Value == _pubId).ToList().Select(p => p.Text).FirstOrDefault();

            //if (!String.IsNullOrWhiteSpace(_titleName)) { model.Location.PublicationTitle = _common.GetStringValue(_titleName, ""); }
            //model.Location.IsPublicationLocation = true;

            #endregion
        }
        /// <summary>
        /// Set location map for display browse map
        /// </summary>
        /// <param name="model"></param>
        private void SetLocationMap(ref BrowseResultsModel model)
        {
            // loop added by Rachna/SA for Maps pointer data send to city.cshtml
            //if (string.IsNullOrEmpty(model.Location.CityID) && !string.IsNullOrEmpty(model.Location.CityName))  // check whether publication exist for the same or not  then no need of creating map
            //{
            //}
            //else
            //{
            //    for (Int32 i = 0; i < model.NewBrowseresultList.Count; i++)
            //    {
            //        if (model.NewBrowseresultList[i].stateid == null || model.NewBrowseresultList[i].stateid == 0)
            //        {
            //            break;
            //        }
            //        else
            //        {
            //            if (i == 0)
            //            {
            //                if (Request.Url.AbsoluteUri.Contains(model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-").ToLower()))
            //                {
            //                    // model.MapAreaCities = (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") + " "
            //                    //     + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList.Count + ",";
            //                    model.MapAreaCities = (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") +
            //                       " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + " " + model.NewBrowseresultList[i].PhysicalLocationLat + " &" + model.NewBrowseresultList[i].PhysicalLocationLong;
            //                    break;
            //                }
            //                else
            //                {
            //                    //  model.MapAreaCities = (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") + " "
            //                    //     + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + ",";
            //                    model.MapAreaCities = (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") +
            //                                    " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + " " + model.NewBrowseresultList[i].PhysicalLocationLat + "&" + model.NewBrowseresultList[i].PhysicalLocationLong;

            //                }
            //            }
            //            else if (i == model.NewBrowseresultList.Count - 1)
            //            {
            //                // model.MapAreaCities = model.MapAreaCities + (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-")
            //                //    + " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount;
            //                model.MapAreaCities = model.MapAreaCities + "," + (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") +
            //          " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + " " + model.NewBrowseresultList[i].PhysicalLocationLat + "&" + model.NewBrowseresultList[i].PhysicalLocationLong;

            //            }
            //            else
            //            {
            //                // model.MapAreaCities = model.MapAreaCities + (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-")
            //                //     + " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + ",";
            //                model.MapAreaCities = model.MapAreaCities + "," + (model.NewBrowseresultList[i].cityName == null ? "" : model.NewBrowseresultList[i].cityName.Replace(" ", "-")) + " " + model.NewBrowseresultList[i].stateName.Replace(" ", "-") +
            //           " " + model.NewBrowseresultList[i].countryAbbr.ToLower().Trim() + " " + model.NewBrowseresultList[i].PublicationCount + " " + model.NewBrowseresultList[i].PhysicalLocationLat + "&" + model.NewBrowseresultList[i].PhysicalLocationLong;
            //            }
            //        }
            //    }
            //}
            switch (model.BrowseType)
            {

                case (int)BrowserType.PublicationByDate:
                    break;
                case (int)BrowserType.PublicationByYear:
                    break;
                case (int)BrowserType.PublicationTitle:
                    var city = model.NewBrowserresult.cityName;
                    GetBrowseMapXmlData(ref model);
                    model.BrowseMapInfoList = (from p in model.BrowseMapInfoList.Where(x => x.CityName == city) select p).ToList();//Select only city which one display in current page.
                    CreateBrowseMapPoint(ref model);

                    model.RenderPartialView = "~/Views/BrowseMap/state/city/city.cshtml";
                    model.RenderMapClass = model.NewBrowserresult.stateName.ToLower().Replace(" ", "").Trim() + "Map";
                    break;
                case (int)BrowserType.City:
                    GetBrowseMapXmlData(ref model);
                    CreateBrowseMapPoint(ref model);
                    if (string.IsNullOrEmpty(model.Location.CityID) && !string.IsNullOrEmpty(model.Location.CityName))
                    {
                        model.RenderPartialView = null;
                    }
                    else
                    {
                        model.RenderPartialView = "~/Views/BrowseMap/state/city/city.cshtml";
                        model.RenderMapClass = model.NewBrowserresult.stateName.ToLower().Replace(" ", "").Trim() + "Map";
                    }
                    break;
                case (int)BrowserType.State:
                    // check if stateid / cityid doesnot exist then no map will come,  added by rachna/SA
                    if (string.IsNullOrEmpty(model.Location.StateID) && !string.IsNullOrEmpty(model.Location.StateName))
                    {
                        model.RenderPartialView = null;
                    }
                    else
                    {
                        model.RenderPartialView = "~/Views/BrowseMap/state/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + ".cshtml";
                        ViewEngineResult result = ViewEngines.Engines.FindView(ControllerContext, model.RenderPartialView, null);
                        if (result.View == null)
                            model.RenderPartialView = "~/Views/BrowseMap/state/defaultstate.cshtml";
                    }
                    break;
            }
        }

        /// <summary>
        ///Read xml from "E:\\BrowserMapXml\\us" location
        /// </summary>
        /// <param name="model"></param>
        private void GetBrowseMapXmlData(ref BrowseResultsModel model)
        {
            string filePath = _config.GetStringValueFromConfig("String.WebsiteInfoXMLPath", "") + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "\\state\\" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-").Trim() + ".xml";

            if (System.IO.File.Exists(filePath))
            {
                XDocument xmlDoc = XDocument.Load(filePath);
                try
                {

                    model.BrowseMapInfoList = (from i in xmlDoc.Descendants("StateMap").Descendants("MapInfomation")
                                               select new BrowseMapLocationInfo()
                                               {
                                                   CityName = _common.GetStringValue(i.Element("CityName").Value, string.Empty),
                                                   PublicationCount = _common.GetIntegerValue(i.Element("PublicationCount").Value, 0),
                                                   MapPointPosition = _common.GetIntegerValue(i.Element("MapPointPosition").Value, 0),
                                               }).ToList();
                }
                catch
                {

                }
            }

        }
        /// <summary>
        /// set  browse map point and link 
        /// </summary>
        /// <param name="model"></param>
        private void CreateBrowseMapPoint(ref BrowseResultsModel model)
        {
            var sbPoint = new StringBuilder();
            var sbLink = new StringBuilder();

            foreach (var R in model.BrowseMapInfoList)
            {
                sbPoint.Append("<div id=\"missouriTt" + R.MapPointPosition + "\" class=\"newTTPopup newLocMapPopup\">");
                sbPoint.Append("<div class=\"arrow\"></div>");
                sbPoint.Append("<h4>" + R.CityName + "</h4>");
                sbPoint.Append("<p>" + R.PublicationCount + " Publication</p>");
                sbPoint.Append("</div>");

                if (model.NewBrowserresult.stateName.ToLower() == "california"
                    || model.NewBrowserresult.stateName.ToLower() == "illinois"
                    || model.NewBrowserresult.stateName.ToLower() == "texas")
                {
                    sbLink.Append("<a href=" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.CityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + " rel=\"#missouriTt" + R.MapPointPosition + "\" class=\"mapPoint mapPointSmall mapPoint" + R.MapPointPosition + "\"></a>");
                }
                else
                {
                    sbLink.Append("<a href=" + Na.Core.Configuration.NaConfig.Url.DomainUrl + "/" + model.NewBrowserresult.countryAbbr.ToLower().Trim() + "/" + model.NewBrowserresult.stateName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + R.CityName.ToLower().Replace(" ", "-").Replace(".", "").Trim() + "/" + " rel=\"#missouriTt" + R.MapPointPosition + "\" class=\"mapPoint mapPoint" + R.MapPointPosition + "\"></a>");
                }
            }

            model.MapToolTip = sbPoint.ToString();
            model.MapToolTipLink = sbLink.ToString();
            sbPoint = null;
            sbLink = null;
        }
        #region
        /// <summary>
        /// Rediract browse page base on select search location(country,state,city,pulication)  
        /// </summary>
        /// <param name="model"></param>
        /// <param name="_browsePage"></param>
        private void fncBrowseRedirect(ref  BrowseResultsModel model, string _browsePage)
        {

            #region First Check PubTitle to redirect into publication page
            if (!String.IsNullOrWhiteSpace(model.Location.PublicationTitleID))
            {
                var pubLocationInfo = _BrowseDataService.GetBrowseLocationByPubID(_common.GetIntegerValue(model.Location.PublicationTitleID, 0));
                // if (pubTitle != null) { _titleName = pubTitle.pubTitleURL; }
                if (pubLocationInfo != null)
                {
                    _countryAbbr = _common.GetStringValue(pubLocationInfo.countryAbbr, "");
                    _stateName = _common.GetStringValue(pubLocationInfo.stateName, "");
                    _cityName = _common.GetStringValue(pubLocationInfo.cityName, "");
                    _pubTitleUrl = _common.GetStringValue(pubLocationInfo.pubTitleURL, "");
                }
                if (!String.IsNullOrWhiteSpace(_countryAbbr)) { model.ReturnUrl = _countryAbbr.ToLower(); }
                if (!String.IsNullOrWhiteSpace(_stateName)) { model.ReturnUrl += "/" + _stateName; }
                if (!String.IsNullOrWhiteSpace(_cityName)) { model.ReturnUrl += "/" + _cityName; }
                if (!String.IsNullOrWhiteSpace(_pubTitleUrl)) { model.ReturnUrl += "/" + _pubTitleUrl; }
            }
            #endregion

            if (String.IsNullOrWhiteSpace(model.ReturnUrl))
            {
                #region Redirect to BrowseLocation
                if (_browsePage == "location")
                {
                    model.ReturnUrl = "browselocations";
                    if (!String.IsNullOrWhiteSpace(_countryId) || !String.IsNullOrWhiteSpace(_stateId) || !String.IsNullOrWhiteSpace(_cityId))
                    {
                        var _locations = _countryService.GetLocationNamesByIds(_common.GetIntegerValue(_countryId, 0), _common.GetIntegerValue(_stateId, 0), _common.GetIntegerValue(_cityId, 0)).SingleOrDefault();
                        if (_locations != null)
                        {
                            _countryAbbr = _common.GetStringValue(_locations.countryAbbr, "");
                            _stateName = _common.GetStringValue(_locations.statename, "");
                            _cityName = _common.GetStringValue(_locations.cityName, "");
                        }
                        if (!String.IsNullOrWhiteSpace(_countryAbbr)) { model.ReturnUrl = _countryAbbr; }
                        if (!String.IsNullOrWhiteSpace(_stateName)) { model.ReturnUrl += "/" + _stateName; }
                        if (!String.IsNullOrWhiteSpace(_cityName)) { model.ReturnUrl += "/" + _cityName; }
                        _locations = null;
                    }
                }
                #endregion

            }

        }
        /// <summary>
        /// Set search term(user given) in search model
        /// </summary>
        /// <param name="model"></param>
        private void SearchModelObj(ref BrowseResultsModel model)
        {
            var searchModel = new SearchResultsModel();
            searchModel.Dates = model.Dates;
            searchModel.Location = model.Location;
            searchModel.FirstName = model.FirstName;
            searchModel.LastName = model.LastName;
            searchModel.AllOfTheWordsString = model.AllOfTheWordsString;
            searchModel.ExactPhraseString = string.Empty;
            searchModel.AnyOfTheWordsString = string.Empty;
            searchModel.WithoutWordsString = string.Empty;

            if (!string.IsNullOrWhiteSpace(searchModel.AllOfTheWordsString)) { if (searchModel.AllOfTheWordsString.Trim().ToLower() == "E.g., Moon Landing") { searchModel.AllOfTheWordsString = ""; } }
            if (!string.IsNullOrWhiteSpace(searchModel.FirstName)) { if (searchModel.FirstName.Trim().ToLower() == "e.g., william") { searchModel.FirstName = ""; } }
            if (!string.IsNullOrWhiteSpace(searchModel.LastName)) { if (searchModel.LastName.Trim().ToLower() == "e.g., smith") { searchModel.LastName = ""; } }

            if (String.IsNullOrWhiteSpace(searchModel.AllOfTheWordsString) && String.IsNullOrWhiteSpace(searchModel.ExactPhraseString) && String.IsNullOrWhiteSpace(searchModel.AnyOfTheWordsString) && String.IsNullOrWhiteSpace(searchModel.LastName))
            {
                model.ReturnUrl = string.Empty;
            }
            else
            {
                if (!string.IsNullOrEmpty(model.Location.CountryID)) { searchModel.Location.IsPublicationLocation = true; }

                var helper = new SearchHelper(_savedSearchService, _common);
                if (searchModel.Dates.IsPublicationDate == false) { searchModel.Dates = new DateModels(); }
                else
                {
                    if (searchModel.Dates.IsExactDate == true)
                    {
                        searchModel.Dates.EndYear = "";
                        searchModel.Dates.EndMonth = "";
                        searchModel.Dates.EndDay = "";
                    }
                    if (searchModel.Dates.IsBetweenYears == true)
                    {
                        searchModel.Dates.StartYear = searchModel.Dates.BetweenStartYear;
                        searchModel.Dates.EndYear = searchModel.Dates.BetweenEndYear;

                        searchModel.Dates.StartMonth = "";
                        searchModel.Dates.StartDay = "";
                        searchModel.Dates.EndMonth = "";
                        searchModel.Dates.EndDay = "";
                    }
                    if (searchModel.Dates.IsBetweenDates == true)
                    {
                        searchModel.Dates.StartYear = searchModel.Dates.BetweenDatesYear;
                        searchModel.Dates.StartMonth = searchModel.Dates.BetweenDatesMonth;
                        searchModel.Dates.StartDay = searchModel.Dates.BetweenDatesDay;
                    }
                }

                if (searchModel.Location.IsPublicationLocation == false) { searchModel.Location = new LocationModels(); }
                model.ReturnUrl = helper.getURLfromSearchValues(searchModel, "", 0);

            }
        }
        #endregion
        #endregion
    }
}
