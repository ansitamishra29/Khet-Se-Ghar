
// ========================================
// KHET SE GHAR TRANSLATION INITIALIZATION
// ========================================

var translations = window.translations || {
    en: {},
    hi: {},
    or: {}
};

window.translations = translations;
Object.assign(translations.en, {
    footerTagline: "Connecting Farms to Homes",
    orderId: "Order ID",
    product: "Product",
    quantity: "Quantity",
    orderDate: "Order Date",
    status: "Status",
    delivered: "Delivered",
    processing: "Processing",
    pending: "Pending",
    loadingRequests: "Loading production requests...",
    loadingBulk: "Loading available bulk requirements...",
    tomatoes: "Tomatoes",
    potatoes: "Potatoes",
    onions: "Onions",
    expected: "Expected:",
    upcoming: "Upcoming",
    readySoon: "Ready Soon",
    transactionId: "Transaction ID",
    date: "Date",
    description: "Description",
    type: "Type",
    amount: "Amount",
    tomatoSales: "Tomato Sales",
    seedsPurchase: "Seeds Purchase",
    potatoSales: "Potato Sales",
    fertilizerPurchase: "Fertilizer Purchase",
    income: "Income",
    expense: "Expense",
    reviewCount: "Based on 45 customer reviews",
    feedbackOne: "Fresh vegetables and excellent quality!",
    feedbackTwo: "Good packaging and timely delivery.",
    customerReview: "— Customer Review",
    accept: "Accept",
    reject: "Reject",
    startPreparing: "Start Preparing",
    markReady: "Mark as Ready",
    requestedQuantity: "Requested Quantity",
    localPartner: "Local Partner",
    deliveryArea: "Delivery Area",
    notSpecified: "Not specified",
    confirmReject: "Are you sure you want to reject this request?",
    unableLoadRequests: "Unable to load requests.",
    serverConnectionError: "Unable to connect to the server.",
    noProductionRequests: "No production requests received yet.",
    unableUpdateRequest: "Unable to update request.",
    status_pending: "PENDING",
    status_accepted: "ACCEPTED",
    status_preparing: "PREPARING",
    status_ready: "READY",
    status_rejected: "REJECTED",
    requirementId: "Requirement ID",
    requiredQuantity: "Required Quantity",
    alreadyAccepted: "Already Accepted",
    remainingQuantity: "Remaining Quantity",
    offeredPrice: "Offered Price",
    deadline: "Deadline",
    contributionQuantity: "Contribution Quantity",
    enterQuantity: "Enter quantity",
    submitContribution: "Submit Contribution",
    unableLoadBulk: "Unable to load bulk requirements.",
    noOpenRequirements: "No open business requirements are currently available.",
    unableSubmitContribution: "Unable to submit contribution.",
    contributionSuccess: "Contribution submitted successfully.",
    validContribution: "Please enter a valid contribution quantity.",
    exceedsRequirement: "Contribution exceeds the remaining requirement."
});

Object.assign(translations.hi, {
    footerTagline: "स्थानीय खेतों को घरों से जोड़ना",
    orderId: "ऑर्डर आईडी",
    product: "उत्पाद",
    quantity: "मात्रा",
    orderDate: "ऑर्डर की तारीख",
    status: "स्थिति",
    delivered: "डिलीवर हो गया",
    processing: "प्रक्रिया में",
    pending: "लंबित",
    loadingRequests: "उत्पादन अनुरोध लोड हो रहे हैं...",
    loadingBulk: "थोक आवश्यकताएँ लोड हो रही हैं...",
    tomatoes: "टमाटर",
    potatoes: "आलू",
    onions: "प्याज़",
    expected: "अनुमानित:",
    upcoming: "आगामी",
    readySoon: "जल्द तैयार",
    transactionId: "लेन-देन आईडी",
    date: "तारीख",
    description: "विवरण",
    type: "प्रकार",
    amount: "राशि",
    tomatoSales: "टमाटर की बिक्री",
    seedsPurchase: "बीज की खरीद",
    potatoSales: "आलू की बिक्री",
    fertilizerPurchase: "उर्वरक की खरीद",
    income: "आय",
    expense: "खर्च",
    reviewCount: "45 ग्राहक समीक्षाओं पर आधारित",
    feedbackOne: "ताज़ी सब्जियाँ और उत्कृष्ट गुणवत्ता!",
    feedbackTwo: "अच्छी पैकेजिंग और समय पर डिलीवरी।",
    customerReview: "— ग्राहक समीक्षा",
    accept: "स्वीकार करें",
    reject: "अस्वीकार करें",
    startPreparing: "तैयारी शुरू करें",
    markReady: "तैयार चिह्नित करें",
    requestedQuantity: "अनुरोधित मात्रा",
    localPartner: "स्थानीय साझेदार",
    deliveryArea: "डिलीवरी क्षेत्र",
    notSpecified: "निर्दिष्ट नहीं",
    confirmReject: "क्या आप वाकई इस अनुरोध को अस्वीकार करना चाहते हैं?",
    unableLoadRequests: "अनुरोध लोड नहीं हो सके।",
    serverConnectionError: "सर्वर से कनेक्ट नहीं हो सका।",
    noProductionRequests: "अभी तक कोई उत्पादन अनुरोध प्राप्त नहीं हुआ है।",
    unableUpdateRequest: "अनुरोध अपडेट नहीं हो सका।",
    status_pending: "लंबित",
    status_accepted: "स्वीकृत",
    status_preparing: "तैयारी में",
    status_ready: "तैयार",
    status_rejected: "अस्वीकृत",
    requirementId: "आवश्यकता आईडी",
    requiredQuantity: "आवश्यक मात्रा",
    alreadyAccepted: "पहले से स्वीकृत",
    remainingQuantity: "शेष मात्रा",
    offeredPrice: "प्रस्तावित कीमत",
    deadline: "अंतिम तारीख",
    contributionQuantity: "योगदान की मात्रा",
    enterQuantity: "मात्रा दर्ज करें",
    submitContribution: "योगदान जमा करें",
    unableLoadBulk: "थोक आवश्यकताएँ लोड नहीं हो सकीं।",
    noOpenRequirements: "वर्तमान में कोई खुली व्यावसायिक आवश्यकता उपलब्ध नहीं है।",
    unableSubmitContribution: "योगदान जमा नहीं हो सका।",
    contributionSuccess: "योगदान सफलतापूर्वक जमा किया गया।",
    validContribution: "कृपया योगदान की सही मात्रा दर्ज करें।",
    exceedsRequirement: "योगदान की मात्रा शेष आवश्यकता से अधिक है।"
});

Object.assign(translations.or, {
    footerTagline: "ସ୍ଥାନୀୟ ଚାଷକୁ ଘର ସହିତ ଯୋଡ଼ିବା",
    orderId: "ଅର୍ଡର ID",
    product: "ଉତ୍ପାଦ",
    quantity: "ପରିମାଣ",
    orderDate: "ଅର୍ଡର ତାରିଖ",
    status: "ସ୍ଥିତି",
    delivered: "ପହଞ୍ଚାଇ ଦିଆଯାଇଛି",
    processing: "ପ୍ରକ୍ରିୟାରେ",
    pending: "ବାକି ଅଛି",
    loadingRequests: "ଉତ୍ପାଦନ ଅନୁରୋଧ ଲୋଡ୍ ହେଉଛି...",
    loadingBulk: "ବହୁଳ ଆବଶ୍ୟକତା ଲୋଡ୍ ହେଉଛି...",
    tomatoes: "ଟମାଟୋ",
    potatoes: "ଆଳୁ",
    onions: "ପିଆଜ",
    expected: "ଆଶା କରାଯାଉଛି:",
    upcoming: "ଆଗାମୀ",
    readySoon: "ଶୀଘ୍ର ପ୍ରସ୍ତୁତ",
    transactionId: "କାରବାର ID",
    date: "ତାରିଖ",
    description: "ବିବରଣୀ",
    type: "ପ୍ରକାର",
    amount: "ରାଶି",
    tomatoSales: "ଟମାଟୋ ବିକ୍ରୟ",
    seedsPurchase: "ବିହନ କ୍ରୟ",
    potatoSales: "ଆଳୁ ବିକ୍ରୟ",
    fertilizerPurchase: "ସାର କ୍ରୟ",
    income: "ଆୟ",
    expense: "ଖର୍ଚ୍ଚ",
    reviewCount: "୪୫ ଜଣ ଗ୍ରାହକଙ୍କ ସମୀକ୍ଷା ଉପରେ ଆଧାରିତ",
    feedbackOne: "ସତେଜ ପନିପରିବା ଏବଂ ଉତ୍କୃଷ୍ଟ ଗୁଣବତ୍ତା!",
    feedbackTwo: "ଭଲ ପ୍ୟାକେଜିଂ ଏବଂ ସମୟାନୁସାରେ ଡେଲିଭରି।",
    customerReview: "— ଗ୍ରାହକ ସମୀକ୍ଷା",
    accept: "ଗ୍ରହଣ କରନ୍ତୁ",
    reject: "ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ",
    startPreparing: "ପ୍ରସ୍ତୁତି ଆରମ୍ଭ କରନ୍ତୁ",
    markReady: "ପ୍ରସ୍ତୁତ ବୋଲି ଚିହ୍ନିତ କରନ୍ତୁ",
    requestedQuantity: "ଅନୁରୋଧ କରାଯାଇଥିବା ପରିମାଣ",
    localPartner: "ସ୍ଥାନୀୟ ସହଯୋଗୀ",
    deliveryArea: "ଡେଲିଭରି ଅଞ୍ଚଳ",
    notSpecified: "ଉଲ୍ଲେଖ ନାହିଁ",
    confirmReject: "ଆପଣ ନିଶ୍ଚିତ ଭାବରେ ଏହି ଅନୁରୋଧକୁ ପ୍ରତ୍ୟାଖ୍ୟାନ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?",
    unableLoadRequests: "ଅନୁରୋଧ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    serverConnectionError: "ସର୍ଭର ସହିତ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ।",
    noProductionRequests: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଉତ୍ପାଦନ ଅନୁରୋଧ ମିଳିନାହିଁ।",
    unableUpdateRequest: "ଅନୁରୋଧ ଅପଡେଟ୍ ହୋଇପାରିଲା ନାହିଁ।",
    status_pending: "ବାକି ଅଛି",
    status_accepted: "ଗ୍ରହଣ କରାଯାଇଛି",
    status_preparing: "ପ୍ରସ୍ତୁତି ଚାଲିଛି",
    status_ready: "ପ୍ରସ୍ତୁତ",
    status_rejected: "ପ୍ରତ୍ୟାଖ୍ୟାନ",
    requirementId: "ଆବଶ୍ୟକତା ID",
    requiredQuantity: "ଆବଶ୍ୟକ ପରିମାଣ",
    alreadyAccepted: "ପୂର୍ବରୁ ଗ୍ରହଣ କରାଯାଇଛି",
    remainingQuantity: "ବାକି ପରିମାଣ",
    offeredPrice: "ପ୍ରସ୍ତାବିତ ମୂଲ୍ୟ",
    deadline: "ଶେଷ ତାରିଖ",
    contributionQuantity: "ଯୋଗଦାନ ପରିମାଣ",
    enterQuantity: "ପରିମାଣ ଲେଖନ୍ତୁ",
    submitContribution: "ଯୋଗଦାନ ଦାଖଲ କରନ୍ତୁ",
    unableLoadBulk: "ବହୁଳ ଆବଶ୍ୟକତା ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    noOpenRequirements: "ବର୍ତ୍ତମାନ କୌଣସି ଖୋଲା ବ୍ୟବସାୟିକ ଆବଶ୍ୟକତା ଉପଲବ୍ଧ ନାହିଁ।",
    unableSubmitContribution: "ଯୋଗଦାନ ଦାଖଲ ହୋଇପାରିଲା ନାହିଁ।",
    contributionSuccess: "ଯୋଗଦାନ ସଫଳତାର ସହିତ ଦାଖଲ ହୋଇଛି।",
    validContribution: "ଦୟାକରି ଏକ ସଠିକ୍ ଯୋଗଦାନ ପରିମାଣ ଲେଖନ୍ତୁ।",
    exceedsRequirement: "ଯୋଗଦାନ ପରିମାଣ ବାକି ଆବଶ୍ୟକତାଠାରୁ ଅଧିକ।"
});


// ========================================
// LOCAL PARTNER DASHBOARD TRANSLATIONS
// ========================================

Object.assign(translations.en, {
    workspace: "Workspace",
    dashboard: "Dashboard",
    customerOrders: "Customer Orders",
    partnerPortal: "Partner Portal",
    operationsAccount: "Operations account",
    logout: "Logout",
    partnerWorkspace: "PARTNER WORKSPACE",
    dashboardOverview: "Dashboard Overview",
    monitorOrders: "Monitor customer orders and manage your delivery operations.",
    operationsActive: "Operations Active",
    totalOrders: "TOTAL ORDERS",
    pendingOrders: "PENDING ORDERS",
    shippedOrders: "SHIPPED ORDERS",
    deliveredOrders: "DELIVERED ORDERS",
    ordersAssigned: "Orders assigned to you",
    awaitingConfirmation: "Awaiting confirmation",
    dispatchedDelivery: "Dispatched for delivery",
    successfullyCompleted: "Successfully completed",
    orderManagement: "ORDER MANAGEMENT",
    reviewAssignedOrders: "Review assigned orders and update their processing status.",
    refreshOrders: "Refresh Orders",
    loadingOrders: "Loading orders...",
    loadingYourOrders: "Loading your orders...",
    sendingRequests: "Sending Requests...",
    updating: "Updating...",
    noFarmerRequests: "No farmer requests sent yet.",
    customer: "Customer",
    deliveryAddress: "Delivery Address",
    orderDate: "Order Date",
    products: "Products",
    total: "Total",
    farmerProductionRequests: "Farmer Production Requests",
    sendFarmerRequests: "Send Farmer Requests",
    confirmOrder: "Confirm Order",
    startProcessing: "Start Processing",
    shipOrder: "Ship Order",
    noOrdersAssigned: "No orders have been assigned to you yet.",
    farmer: "Farmer",
    farm: "Farm",
    requestStatus: "Request Status",
    status_confirmed: "CONFIRMED",
    status_processing: "PROCESSING",
    status_shipped: "SHIPPED",
    status_delivered: "DELIVERED",
    unableLoadOrders: "Unable to load orders.",
    unableLoadFarmerRequests: "Unable to load farmer requests.",
    unableSendFarmerRequests: "Unable to send farmer requests.",
    farmerRequestsSuccess: "Farmer requests sent successfully.",
    unableUpdateOrder: "Unable to update order.",
    orderUpdated: "Order updated successfully."
});

Object.assign(translations.hi, {
    workspace: "कार्यस्थान",
    dashboard: "डैशबोर्ड",
    customerOrders: "ग्राहक के ऑर्डर",
    partnerPortal: "पार्टनर पोर्टल",
    operationsAccount: "संचालन खाता",
    logout: "लॉग आउट",
    partnerWorkspace: "पार्टनर कार्यक्षेत्र",
    dashboardOverview: "डैशबोर्ड का अवलोकन",
    monitorOrders: "ग्राहक के ऑर्डर देखें और डिलीवरी का प्रबंधन करें।",
    operationsActive: "संचालन सक्रिय",
    totalOrders: "कुल ऑर्डर",
    pendingOrders: "लंबित ऑर्डर",
    shippedOrders: "भेजे गए ऑर्डर",
    deliveredOrders: "डिलीवर किए गए ऑर्डर",
    ordersAssigned: "आपको सौंपे गए ऑर्डर",
    awaitingConfirmation: "पुष्टि की प्रतीक्षा में",
    dispatchedDelivery: "डिलीवरी के लिए भेजे गए",
    successfullyCompleted: "सफलतापूर्वक पूरे किए गए",
    orderManagement: "ऑर्डर प्रबंधन",
    reviewAssignedOrders: "सौंपे गए ऑर्डर देखें और उनकी प्रक्रिया की स्थिति अपडेट करें।",
    refreshOrders: "ऑर्डर रीफ्रेश करें",
    loadingOrders: "ऑर्डर लोड हो रहे हैं...",
    loadingYourOrders: "आपके ऑर्डर लोड हो रहे हैं...",
    sendingRequests: "अनुरोध भेजे जा रहे हैं...",
    updating: "अपडेट हो रहा है...",
    noFarmerRequests: "अभी तक किसानों को कोई अनुरोध नहीं भेजा गया है।",
    customer: "ग्राहक",
    deliveryAddress: "डिलीवरी का पता",
    orderDate: "ऑर्डर की तारीख",
    products: "उत्पाद",
    total: "कुल राशि",
    farmerProductionRequests: "किसान उत्पादन अनुरोध",
    sendFarmerRequests: "किसानों को अनुरोध भेजें",
    confirmOrder: "ऑर्डर की पुष्टि करें",
    startProcessing: "प्रक्रिया शुरू करें",
    shipOrder: "ऑर्डर भेजें",
    noOrdersAssigned: "अभी तक आपको कोई ऑर्डर नहीं सौंपा गया है।",
    farmer: "किसान",
    farm: "खेत",
    requestStatus: "अनुरोध की स्थिति",
    status_confirmed: "पुष्टि की गई",
    status_processing: "प्रक्रिया में",
    status_shipped: "भेज दिया गया",
    status_delivered: "डिलीवर हो गया",
    unableLoadOrders: "ऑर्डर लोड नहीं हो सके।",
    unableLoadFarmerRequests: "किसान अनुरोध लोड नहीं हो सके।",
    unableSendFarmerRequests: "किसानों को अनुरोध नहीं भेजे जा सके।",
    farmerRequestsSuccess: "किसानों को अनुरोध सफलतापूर्वक भेजे गए।",
    unableUpdateOrder: "ऑर्डर अपडेट नहीं हो सका।",
    orderUpdated: "ऑर्डर सफलतापूर्वक अपडेट हुआ।"
});

Object.assign(translations.or, {
    workspace: "କାର୍ଯ୍ୟକ୍ଷେତ୍ର",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    customerOrders: "ଗ୍ରାହକଙ୍କ ଅର୍ଡର",
    partnerPortal: "ପାର୍ଟନର ପୋର୍ଟାଲ",
    operationsAccount: "ପରିଚାଳନା ଆକାଉଣ୍ଟ",
    logout: "ଲଗ୍ ଆଉଟ୍",
    partnerWorkspace: "ପାର୍ଟନର କାର୍ଯ୍ୟକ୍ଷେତ୍ର",
    dashboardOverview: "ଡ୍ୟାସବୋର୍ଡ ସମୀକ୍ଷା",
    monitorOrders: "ଗ୍ରାହକଙ୍କ ଅର୍ଡର ଦେଖନ୍ତୁ ଏବଂ ଡେଲିଭରି ପରିଚାଳନା କରନ୍ତୁ।",
    operationsActive: "ପରିଚାଳନା ସକ୍ରିୟ",
    totalOrders: "ମୋଟ ଅର୍ଡର",
    pendingOrders: "ବାକି ଅର୍ଡର",
    shippedOrders: "ପଠାଯାଇଥିବା ଅର୍ଡର",
    deliveredOrders: "ପହଞ୍ଚାଯାଇଥିବା ଅର୍ଡର",
    ordersAssigned: "ଆପଣଙ୍କୁ ଦିଆଯାଇଥିବା ଅର୍ଡର",
    awaitingConfirmation: "ନିଶ୍ଚିତକରଣକୁ ଅପେକ୍ଷାରତ",
    dispatchedDelivery: "ଡେଲିଭରି ପାଇଁ ପଠାଯାଇଛି",
    successfullyCompleted: "ସଫଳତାର ସହିତ ସମ୍ପୂର୍ଣ୍ଣ",
    orderManagement: "ଅର୍ଡର ପରିଚାଳନା",
    reviewAssignedOrders: "ଦିଆଯାଇଥିବା ଅର୍ଡର ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ସେମାନଙ୍କ ସ୍ଥିତି ଅପଡେଟ୍ କରନ୍ତୁ।",
    refreshOrders: "ଅର୍ଡର ରିଫ୍ରେଶ୍ କରନ୍ତୁ",
    loadingOrders: "ଅର୍ଡର ଲୋଡ୍ ହେଉଛି...",
    loadingYourOrders: "ଆପଣଙ୍କ ଅର୍ଡର ଲୋଡ୍ ହେଉଛି...",
    sendingRequests: "ଅନୁରୋଧ ପଠାଯାଉଛି...",
    updating: "ଅପଡେଟ୍ ହେଉଛି...",
    noFarmerRequests: "ଏପର୍ଯ୍ୟନ୍ତ କୃଷକଙ୍କୁ କୌଣସି ଅନୁରୋଧ ପଠାଯାଇନାହିଁ।",
    customer: "ଗ୍ରାହକ",
    deliveryAddress: "ଡେଲିଭରି ଠିକଣା",
    orderDate: "ଅର୍ଡର ତାରିଖ",
    products: "ଉତ୍ପାଦ",
    total: "ମୋଟ",
    farmerProductionRequests: "କୃଷକ ଉତ୍ପାଦନ ଅନୁରୋଧ",
    sendFarmerRequests: "କୃଷକଙ୍କୁ ଅନୁରୋଧ ପଠାନ୍ତୁ",
    confirmOrder: "ଅର୍ଡର ନିଶ୍ଚିତ କରନ୍ତୁ",
    startProcessing: "ପ୍ରକ୍ରିୟା ଆରମ୍ଭ କରନ୍ତୁ",
    shipOrder: "ଅର୍ଡର ପଠାନ୍ତୁ",
    noOrdersAssigned: "ଏପର୍ଯ୍ୟନ୍ତ ଆପଣଙ୍କୁ କୌଣସି ଅର୍ଡର ଦିଆଯାଇନାହିଁ।",
    farmer: "କୃଷକ",
    farm: "ଫାର୍ମ",
    requestStatus: "ଅନୁରୋଧ ସ୍ଥିତି",
    status_confirmed: "ନିଶ୍ଚିତ",
    status_processing: "ପ୍ରକ୍ରିୟାରେ",
    status_shipped: "ପଠାଯାଇଛି",
    status_delivered: "ପହଞ୍ଚାଯାଇଛି",
    unableLoadOrders: "ଅର୍ଡର ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    unableLoadFarmerRequests: "କୃଷକଙ୍କ ଅନୁରୋଧ ଲୋଡ୍ ହୋଇପାରିଲା ନାହିଁ।",
    unableSendFarmerRequests: "କୃଷକଙ୍କୁ ଅନୁରୋଧ ପଠାଯାଇପାରିଲା ନାହିଁ।",
    farmerRequestsSuccess: "କୃଷକଙ୍କୁ ଅନୁରୋଧ ସଫଳତାର ସହିତ ପଠାଯାଇଛି।",
    unableUpdateOrder: "ଅର୍ଡର ଅପଡେଟ୍ ହୋଇପାରିଲା ନାହିଁ।",
    orderUpdated: "ଅର୍ଡର ସଫଳତାର ସହିତ ଅପଡେଟ୍ ହୋଇଛି।"
});

// =====================================
// DELIVERY BOY DASHBOARD TRANSLATIONS
// =====================================

Object.assign(translations.en, {
    deliveryWorkspace: "WORKSPACE",
    deliveryDashboard: "Dashboard",
    deliveryAvailable: "Available Deliveries",
    deliveryMyDeliveries: "My Deliveries",
    deliveryPortal: "Delivery Portal",
    deliveryOperations: "Delivery operations",
    deliveryBreadcrumb: "Delivery Dashboard",
    deliveryRole: "Delivery Boy",
    deliveryLogout: "Logout",
    deliveryEyebrow: "DELIVERY WORKSPACE",
    deliveryTitle: "Delivery Dashboard",
    deliveryDescription: "Manage your delivery assignments and track order progress.",
    deliveryChecking: "Checking availability...",
    deliveryAccount: "YOUR ACCOUNT",
    deliveryPartner: "Delivery Partner",
    deliveryVehicle: "Vehicle: Not provided",
    deliveryAvailability: "Availability",
    deliveryAvailableOption: "Available",
    deliveryInactive: "Inactive",
    deliveryAvailableOrders: "AVAILABLE ORDERS",
    deliveryMyDeliveriesStat: "MY DELIVERIES",
    deliveryCompleted: "COMPLETED",
    deliveryReady: "Ready to be accepted",
    deliveryAssigned: "Assigned to you",
    deliverySuccessfully: "Successfully delivered",
    deliveryPickAssignment: "PICK YOUR ASSIGNMENT",
    deliveryBrowse: "Browse shipped orders and accept a delivery when you are available.",
    deliveryRefresh: "Refresh",
    deliveryLoadingAvailable: "Loading available deliveries...",
    deliveryYourAssignments: "YOUR ASSIGNMENTS",
    deliveryUpdateStatus: "Update the status of your accepted deliveries.",
    deliveryLoadingMine: "Loading your deliveries...",
    deliveryTagline: "Connecting Farms to Homes.",
    deliveryVehiclePrefix: "Vehicle: ",
    deliveryNotProvided: "Not provided",
    deliveryProfileUnavailable: "Profile unavailable",
    deliveryAvailableFor: "Available for deliveries",
    deliveryCurrentlyBusy: "Currently on delivery",
    deliveryCurrentlyInactive: "Currently inactive",
    deliveryAccept: "Accept Delivery",
    deliveryMarkPicked: "Mark as Picked Up",
    deliveryMarkDelivered: "Mark as Delivered",
    deliveryOrder: "Order",
    deliveryCustomerDetails: "Customer Details",
    deliveryCustomer: "Customer",
    deliveryArea: "Delivery Area",
    deliveryAddress: "Delivery Address",
    deliveryTotalAmount: "Total Order Amount",
    deliveryAddressUnavailable: "Address not available",
    deliveryAreaUnspecified: "Area not specified",
    deliveryShipped: "Shipped",
    deliveryPickedUp: "Picked Up",
    deliveryDelivered: "Delivered",
    deliveryProgress: "Delivery Progress",
    deliveryProductDetailsUnavailable: "Product details are not available.",
    deliveryOrderItems: "Order Items",
    deliveryProduct: "Product",
    deliveryLoadingAvailableList: "Loading available deliveries...",
    deliveryNoAvailable: "No deliveries are available right now. Please check again later.",
    deliveryNoAccepted: "You have not accepted any deliveries yet.",
    deliveryConfirmPickup: "Confirm that you have picked up this order?",
    deliveryConfirmDelivered: "Confirm that this order has been delivered?",
    deliveryUpdating: "Updating...",
    deliveryStatusUpdated: "Delivery status updated!",
    deliveryConfirmAccept: "Do you want to accept this delivery?",
    deliveryAccepted: "Delivery accepted successfully!",
    deliveryAvailabilityUpdated: "Availability updated.",
});

Object.assign(translations.hi, {
    deliveryWorkspace: "कार्यस्थल",
    deliveryDashboard: "डैशबोर्ड",
    deliveryAvailable: "उपलब्ध डिलीवरी",
    deliveryMyDeliveries: "मेरी डिलीवरी",
    deliveryPortal: "डिलीवरी पोर्टल",
    deliveryOperations: "डिलीवरी संचालन",
    deliveryBreadcrumb: "डिलीवरी डैशबोर्ड",
    deliveryRole: "डिलीवरी बॉय",
    deliveryLogout: "लॉग आउट",
    deliveryEyebrow: "डिलीवरी कार्यक्षेत्र",
    deliveryTitle: "डिलीवरी डैशबोर्ड",
    deliveryDescription: "अपने डिलीवरी कार्यों को प्रबंधित करें और ऑर्डर की प्रगति देखें।",
    deliveryChecking: "उपलब्धता जाँची जा रही है...",
    deliveryAccount: "आपका खाता",
    deliveryPartner: "डिलीवरी पार्टनर",
    deliveryVehicle: "वाहन: उपलब्ध नहीं",
    deliveryAvailability: "उपलब्धता",
    deliveryAvailableOption: "उपलब्ध",
    deliveryInactive: "निष्क्रिय",
    deliveryAvailableOrders: "उपलब्ध ऑर्डर",
    deliveryMyDeliveriesStat: "मेरी डिलीवरी",
    deliveryCompleted: "पूरी हुई",
    deliveryReady: "स्वीकार करने के लिए तैयार",
    deliveryAssigned: "आपको सौंपे गए",
    deliverySuccessfully: "सफलतापूर्वक डिलीवर किए गए",
    deliveryPickAssignment: "अपना कार्य चुनें",
    deliveryBrowse: "उपलब्ध होने पर भेजे गए ऑर्डर देखें और डिलीवरी स्वीकार करें।",
    deliveryRefresh: "रिफ्रेश करें",
    deliveryLoadingAvailable: "उपलब्ध डिलीवरी लोड हो रही हैं...",
    deliveryYourAssignments: "आपके कार्य",
    deliveryUpdateStatus: "स्वीकार की गई डिलीवरी की स्थिति अपडेट करें।",
    deliveryLoadingMine: "आपकी डिलीवरी लोड हो रही हैं...",
    deliveryTagline: "खेतों को घरों से जोड़ना।",
    deliveryVehiclePrefix: "वाहन: ",
    deliveryNotProvided: "उपलब्ध नहीं",
    deliveryProfileUnavailable: "प्रोफ़ाइल उपलब्ध नहीं है",
    deliveryAvailableFor: "डिलीवरी के लिए उपलब्ध",
    deliveryCurrentlyBusy: "फिलहाल डिलीवरी पर हैं",
    deliveryCurrentlyInactive: "फिलहाल निष्क्रिय हैं",
    deliveryAccept: "डिलीवरी स्वीकार करें",
    deliveryMarkPicked: "पिकअप किया गया चिह्नित करें",
    deliveryMarkDelivered: "डिलीवर किया गया चिह्नित करें",
    deliveryOrder: "ऑर्डर",
    deliveryCustomerDetails: "ग्राहक का विवरण",
    deliveryCustomer: "ग्राहक",
    deliveryArea: "डिलीवरी क्षेत्र",
    deliveryAddress: "डिलीवरी का पता",
    deliveryTotalAmount: "कुल ऑर्डर राशि",
    deliveryAddressUnavailable: "पता उपलब्ध नहीं है",
    deliveryAreaUnspecified: "क्षेत्र निर्दिष्ट नहीं है",
    deliveryShipped: "भेज दिया गया",
    deliveryPickedUp: "पिकअप किया गया",
    deliveryDelivered: "डिलीवर किया गया",
    deliveryProgress: "डिलीवरी की प्रगति",
    deliveryProductDetailsUnavailable: "उत्पाद का विवरण उपलब्ध नहीं है।",
    deliveryOrderItems: "ऑर्डर के उत्पाद",
    deliveryProduct: "उत्पाद",
    deliveryLoadingAvailableList: "उपलब्ध डिलीवरी लोड हो रही हैं...",
    deliveryNoAvailable: "अभी कोई डिलीवरी उपलब्ध नहीं है। कृपया बाद में फिर से जाँचें।",
    deliveryNoAccepted: "आपने अभी तक कोई डिलीवरी स्वीकार नहीं की है।",
    deliveryConfirmPickup: "क्या आप पुष्टि करते हैं कि आपने यह ऑर्डर उठा लिया है?",
    deliveryConfirmDelivered: "क्या आप पुष्टि करते हैं कि यह ऑर्डर डिलीवर हो गया है?",
    deliveryUpdating: "अपडेट हो रहा है...",
    deliveryStatusUpdated: "डिलीवरी की स्थिति अपडेट हो गई है!",
    deliveryConfirmAccept: "क्या आप यह डिलीवरी स्वीकार करना चाहते हैं?",
    deliveryAccepted: "डिलीवरी सफलतापूर्वक स्वीकार कर ली गई!",
    deliveryAvailabilityUpdated: "उपलब्धता अपडेट हो गई है।",
});

Object.assign(translations.or, {
    deliveryWorkspace: "କାର୍ଯ୍ୟକ୍ଷେତ୍ର",
    deliveryDashboard: "ଡ୍ୟାସବୋର୍ଡ",
    deliveryAvailable: "ଉପଲବ୍ଧ ଡେଲିଭରି",
    deliveryMyDeliveries: "ମୋ ଡେଲିଭରି",
    deliveryPortal: "ଡେଲିଭରି ପୋର୍ଟାଲ୍",
    deliveryOperations: "ଡେଲିଭରି ପରିଚାଳନା",
    deliveryBreadcrumb: "ଡେଲିଭରି ଡ୍ୟାସବୋର୍ଡ",
    deliveryRole: "ଡେଲିଭରି ବୟ",
    deliveryLogout: "ଲଗ୍ ଆଉଟ୍",
    deliveryEyebrow: "ଡେଲିଭରି କାର୍ଯ୍ୟକ୍ଷେତ୍ର",
    deliveryTitle: "ଡେଲିଭରି ଡ୍ୟାସବୋର୍ଡ",
    deliveryDescription: "ଆପଣଙ୍କ ଡେଲିଭରି କାର୍ଯ୍ୟ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ଅର୍ଡରର ଅଗ୍ରଗତି ଦେଖନ୍ତୁ।",
    deliveryChecking: "ଉପଲବ୍ଧତା ଯାଞ୍ଚ ହେଉଛି...",
    deliveryAccount: "ଆପଣଙ୍କ ଖାତା",
    deliveryPartner: "ଡେଲିଭରି ପାର୍ଟନର",
    deliveryVehicle: "ଯାନ: ଦିଆଯାଇନାହିଁ",
    deliveryAvailability: "ଉପଲବ୍ଧତା",
    deliveryAvailableOption: "ଉପଲବ୍ଧ",
    deliveryInactive: "ନିଷ୍କ୍ରିୟ",
    deliveryAvailableOrders: "ଉପଲବ୍ଧ ଅର୍ଡର",
    deliveryMyDeliveriesStat: "ମୋ ଡେଲିଭରି",
    deliveryCompleted: "ସମ୍ପୂର୍ଣ୍ଣ",
    deliveryReady: "ଗ୍ରହଣ କରିବାକୁ ପ୍ରସ୍ତୁତ",
    deliveryAssigned: "ଆପଣଙ୍କୁ ଦିଆଯାଇଛି",
    deliverySuccessfully: "ସଫଳତାର ସହିତ ପହଞ୍ଚାଯାଇଛି",
    deliveryPickAssignment: "ଆପଣଙ୍କ କାର୍ଯ୍ୟ ବାଛନ୍ତୁ",
    deliveryBrowse: "ଉପଲବ୍ଧ ଥିବାବେଳେ ପଠାଯାଇଥିବା ଅର୍ଡର ଦେଖନ୍ତୁ ଏବଂ ଡେଲିଭରି ଗ୍ରହଣ କରନ୍ତୁ।",
    deliveryRefresh: "ରିଫ୍ରେସ୍ କରନ୍ତୁ",
    deliveryLoadingAvailable: "ଉପଲବ୍ଧ ଡେଲିଭରି ଲୋଡ୍ ହେଉଛି...",
    deliveryYourAssignments: "ଆପଣଙ୍କ କାର୍ଯ୍ୟ",
    deliveryUpdateStatus: "ଗ୍ରହଣ କରିଥିବା ଡେଲିଭରିର ସ୍ଥିତି ଅପଡେଟ୍ କରନ୍ତୁ।",
    deliveryLoadingMine: "ଆପଣଙ୍କ ଡେଲିଭରି ଲୋଡ୍ ହେଉଛି...",
    deliveryTagline: "କ୍ଷେତରୁ ଘରକୁ ସଂଯୋଗ।",
    deliveryVehiclePrefix: "ଯାନ: ",
    deliveryNotProvided: "ଦିଆଯାଇନାହିଁ",
    deliveryProfileUnavailable: "ପ୍ରୋଫାଇଲ୍ ଉପଲବ୍ଧ ନାହିଁ",
    deliveryAvailableFor: "ଡେଲିଭରି ପାଇଁ ଉପଲବ୍ଧ",
    deliveryCurrentlyBusy: "ବର୍ତ୍ତମାନ ଡେଲିଭରିରେ ଅଛନ୍ତି",
    deliveryCurrentlyInactive: "ବର୍ତ୍ତମାନ ନିଷ୍କ୍ରିୟ ଅଛନ୍ତି",
    deliveryAccept: "ଡେଲିଭରି ଗ୍ରହଣ କରନ୍ତୁ",
    deliveryMarkPicked: "ପିକ୍ଅପ୍ ହୋଇଛି ବୋଲି ଚିହ୍ନଟ କରନ୍ତୁ",
    deliveryMarkDelivered: "ଡେଲିଭରି ହୋଇଛି ବୋଲି ଚିହ୍ନଟ କରନ୍ତୁ",
    deliveryOrder: "ଅର୍ଡର",
    deliveryCustomerDetails: "ଗ୍ରାହକଙ୍କ ବିବରଣୀ",
    deliveryCustomer: "ଗ୍ରାହକ",
    deliveryArea: "ଡେଲିଭରି ଅଞ୍ଚଳ",
    deliveryAddress: "ଡେଲିଭରି ଠିକଣା",
    deliveryTotalAmount: "ମୋଟ ଅର୍ଡର ରାଶି",
    deliveryAddressUnavailable: "ଠିକଣା ଉପଲବ୍ଧ ନାହିଁ",
    deliveryAreaUnspecified: "ଅଞ୍ଚଳ ଉଲ୍ଲେଖ କରାଯାଇନାହିଁ",
    deliveryShipped: "ପଠାଯାଇଛି",
    deliveryPickedUp: "ପିକ୍ଅପ୍ କରାଯାଇଛି",
    deliveryDelivered: "ପହଞ୍ଚାଯାଇଛି",
    deliveryProgress: "ଡେଲିଭରିର ଅଗ୍ରଗତି",
    deliveryProductDetailsUnavailable: "ଉତ୍ପାଦର ବିବରଣୀ ଉପଲବ୍ଧ ନାହିଁ।",
    deliveryOrderItems: "ଅର୍ଡର ସାମଗ୍ରୀ",
    deliveryProduct: "ଉତ୍ପାଦ",
    deliveryLoadingAvailableList: "ଉପଲବ୍ଧ ଡେଲିଭରି ଲୋଡ୍ ହେଉଛି...",
    deliveryNoAvailable: "ବର୍ତ୍ତମାନ କୌଣସି ଡେଲିଭରି ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ପରେ ପୁଣି ଯାଞ୍ଚ କରନ୍ତୁ।",
    deliveryNoAccepted: "ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଡେଲିଭରି ଗ୍ରହଣ କରିନାହାନ୍ତି।",
    deliveryConfirmPickup: "ଆପଣ ଏହି ଅର୍ଡର ଉଠାଇ ନେଇଥିବା ନିଶ୍ଚିତ କରୁଛନ୍ତି କି?",
    deliveryConfirmDelivered: "ଏହି ଅର୍ଡର ଡେଲିଭରି ହୋଇଥିବା ନିଶ୍ଚିତ କରୁଛନ୍ତି କି?",
    deliveryUpdating: "ଅପଡେଟ୍ ହେଉଛି...",
    deliveryStatusUpdated: "ଡେଲିଭରି ସ୍ଥିତି ଅପଡେଟ୍ ହୋଇଛି!",
    deliveryConfirmAccept: "ଆପଣ ଏହି ଡେଲିଭରି ଗ୍ରହଣ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?",
    deliveryAccepted: "ଡେଲିଭରି ସଫଳତାର ସହ ଗ୍ରହଣ କରାଯାଇଛି!",
    deliveryAvailabilityUpdated: "ଉପଲବ୍ଧତା ଅପଡେଟ୍ ହୋଇଛି।",
    
});

// ========================================
// LOGIN PAGE TRANSLATIONS
// ========================================

Object.assign(translations.en, {
    loginWelcome: "Welcome Back!",
    loginSubtitle: "Login to continue to your account.",
    loginEmail: "Email Address",
    loginEmailPlaceholder: "Enter your email",
    loginPassword: "Password",
    loginPasswordPlaceholder: "Enter your password",
    loginButton: "Login",
    loginNoAccount: "Don't have an account?",
    loginSignup: "Sign Up",
    loginBackHome: "← Back to Home"
});

Object.assign(translations.hi, {
    loginWelcome: "वापसी पर स्वागत है!",
    loginSubtitle: "अपने खाते में जारी रखने के लिए लॉगिन करें।",
    loginEmail: "ईमेल पता",
    loginEmailPlaceholder: "अपना ईमेल दर्ज करें",
    loginPassword: "पासवर्ड",
    loginPasswordPlaceholder: "अपना पासवर्ड दर्ज करें",
    loginButton: "लॉगिन करें",
    loginNoAccount: "क्या आपका खाता नहीं है?",
    loginSignup: "साइन अप करें",
    loginBackHome: "← होम पर वापस जाएं"
});

Object.assign(translations.or, {
    loginWelcome: "ପୁଣିଥରେ ସ୍ୱାଗତ!",
    loginSubtitle: "ଆପଣଙ୍କ ଆକାଉଣ୍ଟକୁ ଯିବା ପାଇଁ ଲଗଇନ୍ କରନ୍ତୁ।",
    loginEmail: "ଇମେଲ୍ ଠିକଣା",
    loginEmailPlaceholder: "ଆପଣଙ୍କ ଇମେଲ୍ ଲେଖନ୍ତୁ",
    loginPassword: "ପାସୱାର୍ଡ",
    loginPasswordPlaceholder: "ଆପଣଙ୍କ ପାସୱାର୍ଡ ଲେଖନ୍ତୁ",
    loginButton: "ଲଗଇନ୍ କରନ୍ତୁ",
    loginNoAccount: "ଆପଣଙ୍କର ଆକାଉଣ୍ଟ ନାହିଁ କି?",
    loginSignup: "ସାଇନ୍ ଅପ୍ କରନ୍ତୁ",
    loginBackHome: "← ହୋମକୁ ଫେରନ୍ତୁ"
});


// ========================================
// SIGNUP PAGE TRANSLATIONS
// ========================================

Object.assign(translations.en, {
    signupTitle: "Create Your Account",
    signupSubtitle: "Join Khet Se Ghar and get started.",
    signupFullName: "Full Name",
    signupFullNamePlaceholder: "Enter your full name",
    signupEmail: "Email Address",
    signupEmailPlaceholder: "Enter your email",
    signupAccountType: "Account Type",
    signupSelectAccount: "Select your account type",
    signupCustomer: "Customer",
    signupFarmer: "Farmer",
    signupLocalPartner: "Local Partner",
    signupDeliveryBoy: "Delivery Boy",
    signupBusiness: "Business",
    signupServiceArea: "Service Area",
    signupSelectArea: "Select the area you will serve",
    areaMangalabag: "Mangalabag",
    areaBadambadi: "Badambadi",
    areaCollegeSquare: "College Square",
    areaCDA: "CDA",
    signupBusinessName: "Business Name",
    signupBusinessNamePlaceholder: "Enter your business name",
    signupBusinessCategory: "Business Category",
    signupSelectCategory: "Select business category",
    categoryHotel: "Hotel",
    categoryRestaurant: "Restaurant",
    categoryWholesaler: "Wholesaler",
    categoryRetailer: "Retailer",
    signupGST: "GST Number (Optional)",
    signupGSTPlaceholder: "Enter GST number",
    signupPhone: "Phone Number",
    signupPhonePlaceholder: "Enter your phone number",
    signupAddress: "Address",
    signupAddressPlaceholder: "Enter your complete address",
    signupPassword: "Password",
    signupPasswordPlaceholder: "Create a password",
    signupConfirmPassword: "Confirm Password",
    signupConfirmPasswordPlaceholder: "Confirm your password",
    signupCreateAccount: "Create Account",
    signupHaveAccount: "Already have an account?",
    signupLogin: "Login",
    signupBackHome: "← Back to Home",
    signupBusinessAddress: "Business Address",
});

Object.assign(translations.hi, {
    signupTitle: "अपना खाता बनाएं",
    signupSubtitle: "खेत से घर से जुड़ें और शुरुआत करें।",
    signupFullName: "पूरा नाम",
    signupFullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    signupEmail: "ईमेल पता",
    signupEmailPlaceholder: "अपना ईमेल दर्ज करें",
    signupAccountType: "खाते का प्रकार",
    signupSelectAccount: "अपने खाते का प्रकार चुनें",
    signupCustomer: "ग्राहक",
    signupFarmer: "किसान",
    signupLocalPartner: "स्थानीय साझेदार",
    signupDeliveryBoy: "डिलीवरी बॉय",
    signupBusiness: "व्यवसाय",
    signupServiceArea: "सेवा क्षेत्र",
    signupSelectArea: "वह क्षेत्र चुनें जहाँ आप सेवा देंगे",
    areaMangalabag: "मंगलाबाग",
    areaBadambadi: "बादामबाड़ी",
    areaCollegeSquare: "कॉलेज स्क्वायर",
    areaCDA: "सीडीए",
    signupBusinessName: "व्यवसाय का नाम",
    signupBusinessNamePlaceholder: "अपने व्यवसाय का नाम दर्ज करें",
    signupBusinessCategory: "व्यवसाय की श्रेणी",
    signupSelectCategory: "व्यवसाय की श्रेणी चुनें",
    categoryHotel: "होटल",
    categoryRestaurant: "रेस्टोरेंट",
    categoryWholesaler: "थोक विक्रेता",
    categoryRetailer: "खुदरा विक्रेता",
    signupGST: "जीएसटी नंबर (वैकल्पिक)",
    signupGSTPlaceholder: "जीएसटी नंबर दर्ज करें",
    signupPhone: "फोन नंबर",
    signupPhonePlaceholder: "अपना फोन नंबर दर्ज करें",
    signupAddress: "पता",
    signupAddressPlaceholder: "अपना पूरा पता दर्ज करें",
    signupPassword: "पासवर्ड",
    signupPasswordPlaceholder: "पासवर्ड बनाएं",
    signupConfirmPassword: "पासवर्ड की पुष्टि करें",
    signupConfirmPasswordPlaceholder: "अपना पासवर्ड दोबारा दर्ज करें",
    signupCreateAccount: "खाता बनाएं",
    signupHaveAccount: "क्या आपका पहले से खाता है?",
    signupLogin: "लॉगिन करें",
    signupBackHome: "← होम पर वापस जाएं",
    signupBusinessAddress: "व्यवसाय का पता",
});

Object.assign(translations.or, {
    signupTitle: "ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ",
    signupSubtitle: "ଖେତ ସେ ଘର ସହିତ ଯୋଡ଼ି ହୁଅନ୍ତୁ ଏବଂ ଆରମ୍ଭ କରନ୍ତୁ।",
    signupFullName: "ପୂର୍ଣ୍ଣ ନାମ",
    signupFullNamePlaceholder: "ଆପଣଙ୍କ ପୂର୍ଣ୍ଣ ନାମ ଲେଖନ୍ତୁ",
    signupEmail: "ଇମେଲ୍ ଠିକଣା",
    signupEmailPlaceholder: "ଆପଣଙ୍କ ଇମେଲ୍ ଲେଖନ୍ତୁ",
    signupAccountType: "ଆକାଉଣ୍ଟ ପ୍ରକାର",
    signupSelectAccount: "ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ପ୍ରକାର ବାଛନ୍ତୁ",
    signupCustomer: "ଗ୍ରାହକ",
    signupFarmer: "ଚାଷୀ",
    signupLocalPartner: "ସ୍ଥାନୀୟ ସହଯୋଗୀ",
    signupDeliveryBoy: "ଡେଲିଭରି ବୟ",
    signupBusiness: "ବ୍ୟବସାୟ",
    signupServiceArea: "ସେବା କ୍ଷେତ୍ର",
    signupSelectArea: "ଆପଣ ସେବା ଦେବାକୁ ଥିବା କ୍ଷେତ୍ର ବାଛନ୍ତୁ",
    areaMangalabag: "ମଙ୍ଗଳାବାଗ",
    areaBadambadi: "ବାଦାମବାଡ଼ି",
    areaCollegeSquare: "କଲେଜ୍ ଛକ",
    areaCDA: "ସିଡିଏ",
    signupBusinessName: "ବ୍ୟବସାୟର ନାମ",
    signupBusinessNamePlaceholder: "ଆପଣଙ୍କ ବ୍ୟବସାୟର ନାମ ଲେଖନ୍ତୁ",
    signupBusinessCategory: "ବ୍ୟବସାୟ ବର୍ଗ",
    signupSelectCategory: "ବ୍ୟବସାୟ ବର୍ଗ ବାଛନ୍ତୁ",
    categoryHotel: "ହୋଟେଲ୍",
    categoryRestaurant: "ରେଷ୍ଟୁରାଣ୍ଟ",
    categoryWholesaler: "ପାଇକାରୀ ବିକ୍ରେତା",
    categoryRetailer: "ଖୁଚୁରା ବିକ୍ରେତା",
    signupGST: "ଜିଏସଟି ନମ୍ବର (ଇଚ୍ଛାଧୀନ)",
    signupGSTPlaceholder: "ଜିଏସଟି ନମ୍ବର ଲେଖନ୍ତୁ",
    signupPhone: "ଫୋନ୍ ନମ୍ବର",
    signupPhonePlaceholder: "ଆପଣଙ୍କ ଫୋନ୍ ନମ୍ବର ଲେଖନ୍ତୁ",
    signupAddress: "ଠିକଣା",
    signupAddressPlaceholder: "ଆପଣଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ଠିକଣା ଲେଖନ୍ତୁ",
    signupPassword: "ପାସୱାର୍ଡ",
    signupPasswordPlaceholder: "ଏକ ପାସୱାର୍ଡ ତିଆରି କରନ୍ତୁ",
    signupConfirmPassword: "ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ",
    signupConfirmPasswordPlaceholder: "ପାସୱାର୍ଡ ପୁଣିଥରେ ଲେଖନ୍ତୁ",
    signupCreateAccount: "ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ",
    signupHaveAccount: "ଆପଣଙ୍କର ପୂର୍ବରୁ ଆକାଉଣ୍ଟ ଅଛି କି?",
    signupLogin: "ଲଗଇନ୍ କରନ୍ତୁ",
    signupBackHome: "← ହୋମକୁ ଫେରନ୍ତୁ",
    signupBusinessAddress: "ବ୍ୟବସାୟ ଠିକଣା",
});

// ========================================
// CUSTOMER DASHBOARD TRANSLATIONS
// ========================================

Object.assign(translations.en, {
    searchPlaceholder: "Search fresh vegetables, fruits...",
    search: "Search",
    shop: "Shop",
    myCart: "My Cart",
    myOrders: "My Orders",
    myProfile: "My Profile",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    dairy: "Dairy",
    specialOffers: "Special Offers",
    heroTag: "FRESHNESS YOU CAN TRUST",
    heroTitle: "Fresh From Farm, Delivered To Home.",
    heroText: "Enjoy fresh and quality farm products directly through Khet Se Ghar.",
    exploreProducts: "Explore Products",
    shopByCategory: "Shop by Category",
    categoryDescription: "Explore fresh products from local farms",
    dairyProducts: "Dairy Products",
    popularProducts: "Popular Farm Products",
    popularDescription: "Fresh picks for your everyday needs",
    viewAllProducts: "View All Products →",
    freshLocal: "Fresh & Local",
    freshPotatoes: "Fresh Potatoes",
    potatoDescription: "Farm fresh quality",
    freshTomatoes: "Fresh Tomatoes",
    tomatoDescription: "Locally harvested",
    freshBananas: "Fresh Bananas",
    bananaDescription: "Naturally ripened",
    freshCarrots: "Fresh Carrots",
    carrotDescription: "Selected farm produce",
    localFarmer: "Local Farmer",
    add: "ADD",
    freshDeals: "FRESH DEALS",
    betterPrices: "Good Food. Better Prices.",
    offerDescription: "Discover special deals on selected farm-fresh products.",
    exploreDeals: "Explore Deals",
    profileDescription: "Manage your personal information here.",
    footerDescription: "Connecting local farms to your home.",
    copyright: "© 2026 Khet Se Ghar. All Rights Reserved."
});

Object.assign(translations.hi, {
    searchPlaceholder: "ताज़ी सब्जियाँ, फल खोजें...",
    search: "खोजें",
    shop: "खरीदारी",
    myCart: "मेरी कार्ट",
    myOrders: "मेरे ऑर्डर",
    myProfile: "मेरी प्रोफ़ाइल",
    vegetables: "सब्जियाँ",
    fruits: "फल",
    grains: "अनाज",
    dairy: "डेयरी",
    specialOffers: "विशेष ऑफ़र",
    heroTag: "ताज़गी जिस पर आप भरोसा कर सकते हैं",
    heroTitle: "खेतों से ताज़ा, सीधे आपके घर तक।",
    heroText: "खेत से घर के माध्यम से सीधे ताज़े और गुणवत्तापूर्ण कृषि उत्पादों का आनंद लें।",
    exploreProducts: "उत्पाद देखें",
    shopByCategory: "श्रेणी के अनुसार खरीदें",
    categoryDescription: "स्थानीय खेतों से ताज़े उत्पाद देखें",
    dairyProducts: "डेयरी उत्पाद",
    popularProducts: "लोकप्रिय कृषि उत्पाद",
    popularDescription: "आपकी रोज़मर्रा की ज़रूरतों के लिए ताज़े उत्पाद",
    viewAllProducts: "सभी उत्पाद देखें →",
    freshLocal: "ताज़ा और स्थानीय",
    freshPotatoes: "ताज़े आलू",
    potatoDescription: "खेतों से ताज़ी गुणवत्ता",
    freshTomatoes: "ताज़े टमाटर",
    tomatoDescription: "स्थानीय खेतों से तोड़े गए",
    freshBananas: "ताज़े केले",
    bananaDescription: "प्राकृतिक रूप से पके हुए",
    freshCarrots: "ताज़ी गाजर",
    carrotDescription: "चुने हुए कृषि उत्पाद",
    localFarmer: "स्थानीय किसान",
    add: "जोड़ें",
    freshDeals: "ताज़ा ऑफ़र",
    betterPrices: "अच्छा भोजन। बेहतर कीमतें।",
    offerDescription: "चुने हुए ताज़े कृषि उत्पादों पर विशेष ऑफ़र देखें।",
    exploreDeals: "ऑफ़र देखें",
    profileDescription: "यहाँ अपनी व्यक्तिगत जानकारी प्रबंधित करें।",
    footerDescription: "स्थानीय खेतों को आपके घर से जोड़ना।",
    copyright: "© 2026 खेत से घर। सर्वाधिकार सुरक्षित।"
});

Object.assign(translations.or, {
    searchPlaceholder: "ସତେଜ ପନିପରିବା, ଫଳ ଖୋଜନ୍ତୁ...",
    search: "ଖୋଜନ୍ତୁ",
    shop: "କିଣନ୍ତୁ",
    myCart: "ମୋ କାର୍ଟ",
    myOrders: "ମୋ ଅର୍ଡର",
    myProfile: "ମୋ ପ୍ରୋଫାଇଲ୍",
    vegetables: "ପନିପରିବା",
    fruits: "ଫଳ",
    grains: "ଶସ୍ୟ",
    dairy: "ଦୁଗ୍ଧଜାତ ଦ୍ରବ୍ୟ",
    specialOffers: "ବିଶେଷ ଅଫର୍",
    heroTag: "ଭରସାଯୋଗ୍ୟ ସତେଜତା",
    heroTitle: "କ୍ଷେତରୁ ସତେଜ, ସିଧା ଆପଣଙ୍କ ଘରକୁ।",
    heroText: "ଖେତ ସେ ଘର ମାଧ୍ୟମରେ ସତେଜ ଏବଂ ଉତ୍ତମ ଗୁଣବତ୍ତାର କୃଷିଜାତ ଉତ୍ପାଦ ଉପଭୋଗ କରନ୍ତୁ।",
    exploreProducts: "ଉତ୍ପାଦ ଦେଖନ୍ତୁ",
    shopByCategory: "ବର୍ଗ ଅନୁସାରେ କିଣନ୍ତୁ",
    categoryDescription: "ସ୍ଥାନୀୟ ଚାଷଜମିରୁ ସତେଜ ଉତ୍ପାଦ ଦେଖନ୍ତୁ",
    dairyProducts: "ଦୁଗ୍ଧଜାତ ଉତ୍ପାଦ",
    popularProducts: "ଲୋକପ୍ରିୟ କୃଷିଜାତ ଉତ୍ପାଦ",
    popularDescription: "ଆପଣଙ୍କ ଦୈନନ୍ଦିନ ଆବଶ୍ୟକତା ପାଇଁ ସତେଜ ଉତ୍ପାଦ",
    viewAllProducts: "ସମସ୍ତ ଉତ୍ପାଦ ଦେଖନ୍ତୁ →",
    freshLocal: "ସତେଜ ଏବଂ ସ୍ଥାନୀୟ",
    freshPotatoes: "ସତେଜ ଆଳୁ",
    potatoDescription: "ଚାଷଜମିରୁ ସତେଜ ଏବଂ ଉତ୍ତମ ଗୁଣବତ୍ତା",
    freshTomatoes: "ସତେଜ ଟମାଟୋ",
    tomatoDescription: "ସ୍ଥାନୀୟ ଭାବେ ଅମଳ କରାଯାଇଛି",
    freshBananas: "ସତେଜ କଦଳୀ",
    bananaDescription: "ପ୍ରାକୃତିକ ଭାବେ ପାଚିଛି",
    freshCarrots: "ସତେଜ ଗାଜର",
    carrotDescription: "ବଛା ବଛା ଚାଷଜମିର ଉତ୍ପାଦ",
    localFarmer: "ସ୍ଥାନୀୟ ଚାଷୀ",
    add: "ଯୋଡ଼ନ୍ତୁ",
    freshDeals: "ସତେଜ ଅଫର୍",
    betterPrices: "ଭଲ ଖାଦ୍ୟ। ଉତ୍ତମ ମୂଲ୍ୟ।",
    offerDescription: "ବଛା ବଛା ସତେଜ କୃଷିଜାତ ଉତ୍ପାଦ ଉପରେ ବିଶେଷ ଅଫର୍ ଦେଖନ୍ତୁ।",
    exploreDeals: "ଅଫର୍ ଦେଖନ୍ତୁ",
    profileDescription: "ଏଠାରେ ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ସୂଚନା ପରିଚାଳନା କରନ୍ତୁ।",
    footerDescription: "ସ୍ଥାନୀୟ ଚାଷଜମିକୁ ଆପଣଙ୍କ ଘର ସହିତ ଯୋଡ଼ିବା।",
    copyright: "© 2026 ଖେତ ସେ ଘର। ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।"
});



// ========================================
// LANGUAGE TRANSLATION SYSTEM
// ========================================

(function () {

    const savedLanguage = localStorage.getItem("ksg_language") || "en";

    function applyTranslations(language) {

        const selectedLanguage = translations[language]
            ? language
            : "en";

        const dictionary = translations[selectedLanguage];

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.getAttribute("data-i18n");

            if (dictionary[key] !== undefined) {
                element.textContent = dictionary[key];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.getAttribute("data-i18n-placeholder");

            if (dictionary[key] !== undefined) {
                element.placeholder = dictionary[key];
            }
        });

        document.documentElement.lang = selectedLanguage;

        localStorage.setItem("ksg_language", selectedLanguage);

        document.dispatchEvent(new Event("ksgLanguageChanged"));
    }

    // Shared translation function for dynamic content
    window.ksgTranslate = function (key) {

        const language = localStorage.getItem("ksg_language") || "en";

        const dictionary = translations[language] || translations.en;

        return dictionary[key] !== undefined
            ? dictionary[key]
            : translations.en[key] || key;
    };

    function createLanguageSelector() {

        if (document.getElementById("ksg-language-selector")) {
            return;
        }

        const container = document.createElement("div");

        container.id = "ksg-language-selector";

        container.innerHTML = `
            <label for="ksg-language">
                🌐 Language / भाषा / ଭାଷା
            </label>

            <select id="ksg-language">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="or">ଓଡ଼ିଆ</option>
            </select>
        `;

        container.style.cssText = `
            position: relative;
            background: white;
            padding: 6px 10px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            height: 38px;
            box-sizing: border-box;
            margin-left: auto;
            flex-shrink: 0;
            white-space: nowrap;
        `;

        const select = container.querySelector("select");

        select.style.cssText = `
            width: 105px;
            height: 28px;
            padding: 4px 7px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            box-sizing: border-box;
        `;

        select.value = savedLanguage;

        select.addEventListener("change", function () {
            applyTranslations(this.value);
        });

        // Local Partner Dashboard placement
        const partnerActions = document.querySelector(".topbar-actions");
        const loginLanguage = document.querySelector("#auth-language");

        // Customer Dashboard placement
        const customerLogout = document.querySelector(
            ".customer-nav .logout-link"
        );

        // Farmer Dashboard placement
       const farmerHeaderActions = document.querySelector(".farmer-header-actions");
       const farmerHeader = document.querySelector(".farmer-header");

        // Delivery Dashboard placement
        const deliveryLogout = document.querySelector("#logout-btn");

        if (partnerActions) {

            partnerActions.insertAdjacentElement("afterbegin", container);

        } else if (loginLanguage) {

            loginLanguage.appendChild(container);

        } else {

            const logoutButton = customerLogout || deliveryLogout;

            if (farmerHeaderActions) {

    farmerHeaderActions.appendChild(container);

} else if (farmerHeader) {

    farmerHeader.appendChild(container);

} else if (logoutButton) {
                logoutButton.insertAdjacentElement(
                    "afterend",
                    container
                );

            } else {

                document.body.appendChild(container);

            }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {

        createLanguageSelector();

        applyTranslations(savedLanguage);

    });

})();
