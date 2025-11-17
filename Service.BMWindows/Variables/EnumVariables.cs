
namespace Service.Core.Variables
{
    public enum ActionType
    {
        GetOne, // 0
        GetMany // 1
    }

    public enum ModuleCode
    {
        Employee,
        TD,
        DD,
        DT,
        PT,
        KPI,
        CB,
        QHLD,
        TNTT
    }
    public enum ObjectType
    {
        Article,
        ArticleCategory,
        Product,
        ProductCategory,
        Brand,
        UserProfile,
        Supplier,
        Store,
        SystemUser,
        StoreImport,
        StoreExport,
        StoreTransform,
        RequestStoreTransform,
        BillOnline,
        Attribute,
        Slideshow,
        Unit,
        Country,
        District,
        Comment,
        StoreReturn,
        BillDebt,
        BillOffline,
        Receipt,
        Spent,
        StoreGuarantee,
        Customer
    }

    public enum Reliable
    {
        Email = 0,
        Mobile = 1,
        Profile = 2
    }
    public enum OrderType
    {
        Random,
        CreatedDate
    }
    public enum SentDateType
    {
        OneTimeOneDay = 0,
        OneTimeTwoDay = 1,
        OneTimeThreeDay = 2,
        OneTimeOneMonth = 3
    }
    public enum EmailType
    {
        ActivateTheAccount,
        ProjectError,
        AcceptProjectSuccess,
        ChangeStatusProject,
        ResetPassword,
        Personal,
        Billing,
        ContactToCreator,
        News,
        Projects,
        Recharge
    }

    public enum ErrorCode
    {
        None, //0
        Unknown,  //1
        ObjectIsNotFound,  //2
        UnAuthentication,  //3
        AccountIsNotEnoughMoney,  //4
        AcceptedButUnpaid,  //5
        FolderHasBeenFull,  //6
        InvalidOperation,  //7
        ObjectIsExist,  //8
        FileNotFound, //9

    }

    public enum ObjectState
    {
        Top = 1,
        Highlight = 2,
        Viewmore = 3,
        Focus = 4,
        Hot = 5
    }
    public enum ObjectStatus
    {
        Pending = 0,
        Active = 1,
        Error = 2,
        NoStatus = 3,
        Disable = 4,
        Expired = 5,
    }

    public enum AmountType
    {
        Master,
        Pa
    }

    public enum UserCustomRole
    {
        Administrators = 1,
        ContentManagers = 2,
        CustomerCares = 3,
        Customers = 4,
        Subscribers = 5,
        StoreManagers,
        Accountants
    }
    public enum Requests
    {
        update = 0,
        request = 1,
        notupdate = 2

    }

    public enum SuggestionType
    {
        Keyword = 0,
        ProjectCategory = 1,
        ProjectCategoryInCountry = 2,
        ProjectCategoryInDistrict = 3,
        ProjectCategoryInWard = 4,
        ProjectCategoryInProperty = 5,
        Property = 6,
        Company = 7,
        Customer = 8,
        Project = 9,
        Country = 10,
        District = 11,
        Ward = 12
    }

    public enum DatabaseType
    {
        Account,
        General,
        Product,
        Report
    }

    public enum PageType
    {
        Home = 1,
        Topic = 2,
        ArticleCategories = 3,
        ArticleDetail = 4,
        ProjectCategories = 5,
        ProjectDetail = 6,
        PropertyCategories = 7,
        PropertyDetail = 8
    }

    public enum Package
    {
        DAYLY = 1,
        WEEKLY = 7,
        MONTHLY = 30
    }

    public enum PaymentMethod
    {
        Account = 0,
        Tranfer = 1, // chuyen khoan
        Cash = 2 // tien mat
    }
}