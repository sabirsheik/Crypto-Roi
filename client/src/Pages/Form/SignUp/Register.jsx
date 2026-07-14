import { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeProvider";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth/AuthUser";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const countryList = [
  { name: "AFGHANISTAN", code: "93" },
  { name: "ALBANIA", code: "355" },
  { name: "ALGERIA", code: "213" },
  { name: "ANDORRA", code: "376" },
  { name: "ANGOLA", code: "244" },
  { name: "ANTIGUA AND BARBUDA", code: "1268" },
  { name: "ARGENTINA", code: "54" },
  { name: "ARMENIA", code: "374" },
  { name: "AUSTRALIA", code: "61" },
  { name: "AUSTRIA", code: "43" },
  { name: "AZERBAIJAN", code: "994" },
  { name: "BAHAMAS", code: "1242" },
  { name: "BAHRAIN", code: "973" },
  { name: "BANGLADESH", code: "880" },
  { name: "BARBADOS", code: "1246" },
  { name: "BELARUS", code: "375" },
  { name: "BELGIUM", code: "32" },
  { name: "BELIZE", code: "501" },
  { name: "BENIN", code: "229" },
  { name: "BHUTAN", code: "975" },
  { name: "BOLIVIA", code: "591" },
  { name: "BOSNIA AND HERZEGOVINA", code: "387" },
  { name: "BOTSWANA", code: "267" },
  { name: "BRAZIL", code: "55" },
  { name: "BRUNEI", code: "673" },
  { name: "BULGARIA", code: "359" },
  { name: "BURKINA FASO", code: "226" },
  { name: "BURUNDI", code: "257" },
  { name: "CAMBODIA", code: "855" },
  { name: "CAMEROON", code: "237" },
  { name: "CANADA", code: "1" },
  { name: "CAPE VERDE", code: "238" },
  { name: "CENTRAL AFRICAN REPUBLIC", code: "236" },
  { name: "CHAD", code: "235" },
  { name: "CHILE", code: "56" },
  { name: "CHINA", code: "86" },
  { name: "COLOMBIA", code: "57" },
  { name: "COMOROS", code: "269" },
  { name: "CONGO", code: "242" },
  { name: "COSTA RICA", code: "506" },
  { name: "CROATIA", code: "385" },
  { name: "CUBA", code: "53" },
  { name: "CYPRUS", code: "357" },
  { name: "CZECH REPUBLIC", code: "420" },
  { name: "DENMARK", code: "45" },
  { name: "DJIBOUTI", code: "253" },
  { name: "DOMINICA", code: "1767" },
  { name: "DOMINICAN REPUBLIC", code: "1809" },
  { name: "ECUADOR", code: "593" },
  { name: "EGYPT", code: "20" },
  { name: "EL SALVADOR", code: "503" },
  { name: "EQUATORIAL GUINEA", code: "240" },
  { name: "ERITREA", code: "291" },
  { name: "ESTONIA", code: "372" },
  { name: "ESWATINI", code: "268" },
  { name: "ETHIOPIA", code: "251" },
  { name: "FIJI", code: "679" },
  { name: "FINLAND", code: "358" },
  { name: "FRANCE", code: "33" },
  { name: "GABON", code: "241" },
  { name: "GAMBIA", code: "220" },
  { name: "GEORGIA", code: "995" },
  { name: "GERMANY", code: "49" },
  { name: "GHANA", code: "233" },
  { name: "GREECE", code: "30" },
  { name: "GRENADA", code: "1473" },
  { name: "GUATEMALA", code: "502" },
  { name: "GUINEA", code: "224" },
  { name: "GUINEA-BISSAU", code: "245" },
  { name: "GUYANA", code: "592" },
  { name: "HAITI", code: "509" },
  { name: "HONDURAS", code: "504" },
  { name: "HUNGARY", code: "36" },
  { name: "ICELAND", code: "354" },
  { name: "INDIA", code: "91" },
  { name: "INDONESIA", code: "62" },
  { name: "IRAN", code: "98" },
  { name: "IRAQ", code: "964" },
  { name: "IRELAND", code: "353" },
  { name: "ISRAEL", code: "972" },
  { name: "ITALY", code: "39" },
  { name: "JAMAICA", code: "1876" },
  { name: "JAPAN", code: "81" },
  { name: "JORDAN", code: "962" },
  { name: "KAZAKHSTAN", code: "7" },
  { name: "KENYA", code: "254" },
  { name: "KIRIBATI", code: "686" },
  { name: "KUWAIT", code: "965" },
  { name: "KYRGYZSTAN", code: "996" },
  { name: "LAOS", code: "856" },
  { name: "LATVIA", code: "371" },
  { name: "LEBANON", code: "961" },
  { name: "LESOTHO", code: "266" },
  { name: "LIBERIA", code: "231" },
  { name: "LIBYA", code: "218" },
  { name: "LIECHTENSTEIN", code: "423" },
  { name: "LITHUANIA", code: "370" },
  { name: "LUXEMBOURG", code: "352" },
  { name: "MADAGASCAR", code: "261" },
  { name: "MALAWI", code: "265" },
  { name: "MALAYSIA", code: "60" },
  { name: "MALDIVES", code: "960" },
  { name: "MALI", code: "223" },
  { name: "MALTA", code: "356" },
  { name: "MARSHALL ISLANDS", code: "692" },
  { name: "MAURITANIA", code: "222" },
  { name: "MAURITIUS", code: "230" },
  { name: "MEXICO", code: "52" },
  { name: "MICRONESIA", code: "691" },
  { name: "MOLDOVA", code: "373" },
  { name: "MONACO", code: "377" },
  { name: "MONGOLIA", code: "976" },
  { name: "MONTENEGRO", code: "382" },
  { name: "MOROCCO", code: "212" },
  { name: "MOZAMBIQUE", code: "258" },
  { name: "MYANMAR", code: "95" },
  { name: "NAMIBIA", code: "264" },
  { name: "NAURU", code: "674" },
  { name: "NEPAL", code: "977" },
  { name: "NETHERLANDS", code: "31" },
  { name: "NEW ZEALAND", code: "64" },
  { name: "NICARAGUA", code: "505" },
  { name: "NIGER", code: "227" },
  { name: "NIGERIA", code: "234" },
  { name: "NORTH KOREA", code: "850" },
  { name: "NORTH MACEDONIA", code: "389" },
  { name: "NORWAY", code: "47" },
  { name: "OMAN", code: "968" },
  { name: "PAKISTAN", code: "92" },
  { name: "PALAU", code: "680" },
  { name: "PALESTINE", code: "970" },
  { name: "PANAMA", code: "507" },
  { name: "PAPUA NEW GUINEA", code: "675" },
  { name: "PARAGUAY", code: "595" },
  { name: "PERU", code: "51" },
  { name: "PHILIPPINES", code: "63" },
  { name: "POLAND", code: "48" },
  { name: "PORTUGAL", code: "351" },
  { name: "QATAR", code: "974" },
  { name: "ROMANIA", code: "40" },
  { name: "RUSSIA", code: "7" },
  { name: "RWANDA", code: "250" },
  { name: "SAINT KITTS AND NEVIS", code: "1869" },
  { name: "SAINT LUCIA", code: "1758" },
  { name: "SAINT VINCENT AND THE GRENADINES", code: "1784" },
  { name: "SAMOA", code: "685" },
  { name: "SAN MARINO", code: "378" },
  { name: "SAO TOME AND PRINCIPE", code: "239" },
  { name: "SAUDI ARABIA", code: "966" },
  { name: "SENEGAL", code: "221" },
  { name: "SERBIA", code: "381" },
  { name: "SEYCHELLES", code: "248" },
  { name: "SIERRA LEONE", code: "232" },
  { name: "SINGAPORE", code: "65" },
  { name: "SLOVAKIA", code: "421" },
  { name: "SLOVENIA", code: "386" },
  { name: "SOLOMON ISLANDS", code: "677" },
  { name: "SOMALIA", code: "252" },
  { name: "SOUTH AFRICA", code: "27" },
  { name: "SOUTH KOREA", code: "82" },
  { name: "SOUTH SUDAN", code: "211" },
  { name: "SPAIN", code: "34" },
  { name: "SRI LANKA", code: "94" },
  { name: "SUDAN", code: "249" },
  { name: "SURINAME", code: "597" },
  { name: "SWEDEN", code: "46" },
  { name: "SWITZERLAND", code: "41" },
  { name: "SYRIA", code: "963" },
  { name: "TAIWAN", code: "886" },
  { name: "TAJIKISTAN", code: "992" },
  { name: "TANZANIA", code: "255" },
  { name: "THAILAND", code: "66" },
  { name: "TIMOR-LESTE", code: "670" },
  { name: "TOGO", code: "228" },
  { name: "TONGA", code: "676" },
  { name: "TRINIDAD AND TOBAGO", code: "1868" },
  { name: "TUNISIA", code: "216" },
  { name: "TURKEY", code: "90" },
  { name: "TURKMENISTAN", code: "993" },
  { name: "TUVALU", code: "688" },
  { name: "UGANDA", code: "256" },
  { name: "UKRAINE", code: "380" },
  { name: "UNITED ARAB EMIRATES", code: "971" },
  { name: "UNITED KINGDOM", code: "44" },
  { name: "UNITED STATES", code: "1" },
  { name: "URUGUAY", code: "598" },
  { name: "UZBEKISTAN", code: "998" },
  { name: "VANUATU", code: "678" },
  { name: "VATICAN CITY", code: "379" },
  { name: "VENEZUELA", code: "58" },
  { name: "VIETNAM", code: "84" },
  { name: "YEMEN", code: "967" },
  { name: "ZAMBIA", code: "260" },
  { name: "ZIMBABWE", code: "263" },
];

const Register = () => {
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("92");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    referralId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: "",
    termsAccepted: false,
    role: "user",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralId: ref }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") {
      const selected = countryList.find((c) => c.name === value);
      if (selected) setSelectedCountryCode(selected.code);
    }

    if (name === "password") {
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      if (value.length === 0) setPasswordStrength("");
      else if (value.length >= 8 && hasUpper && hasLower && hasNumber)
        setPasswordStrength("strong");
      else if (
        value.length >= 6 &&
        ((hasUpper && hasNumber) ||
          (hasLower && hasNumber) ||
          (hasUpper && hasLower))
      )
        setPasswordStrength("good");
      else setPasswordStrength("weak");
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.termsAccepted)
      newErrors.termsAccepted = "You must agree to terms";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        refCode: formData.referralId,
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        country: formData.country,
        phone: `+${selectedCountryCode}${formData.phone}`,
        role: formData.role,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/register`,
        payload
      );
      login(res.data.token, res.data.user);
      toast.success("Registered & Logged In");
      
      if (res.data.user.role === "admin" || res.data.user.role === "manager") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      const detailMsg = err.response?.data?.extraDetails;

      toast.error(backendMsg || "Registration Failed");

      if (detailMsg) {
        if (detailMsg.toLowerCase().includes("name"))
          setErrors((prev) => ({ ...prev, fullName: detailMsg }));
        if (detailMsg.toLowerCase().includes("email"))
          setErrors((prev) => ({ ...prev, email: detailMsg }));
        if (detailMsg.toLowerCase().includes("password"))
          setErrors((prev) => ({ ...prev, password: detailMsg }));
        if (detailMsg.toLowerCase().includes("country"))
          setErrors((prev) => ({ ...prev, country: detailMsg }));
        if (detailMsg.toLowerCase().includes("phone"))
          setErrors((prev) => ({ ...prev, phone: detailMsg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === "weak") return "bg-red-500";
    if (passwordStrength === "good") return "bg-yellow-500";
    if (passwordStrength === "strong") return "bg-green-500";
    return "";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
        <div className="w-full flex justify-center items-center px-6 md:px-16 py-12">
          <div className={`w-full max-w-lg backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ${
              darkMode ? "bg-white/10 border border-gray-700" : "bg-gray-100 border-gray-300"
            }`}
          >
            <h2 className="text-center text-3xl font-bold mb-2">
              <span className={darkMode ? "text-white" : "text-black"}>Ai</span>
              <span className="text-green-400"> World Teach </span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {[ // unchanged fields
                {
                  label: "Referral ID Optional",
                  name: "referralId",
                  placeholder: "Enter Referral ID Optional",
                  disabled: false,
                },
                {
                  label: "Full Name",
                  name: "fullName",
                  placeholder: "Enter Full Name",
                  errorKey: "fullName",
                },
                {
                  label: "Email",
                  name: "email",
                  type: "email",
                  placeholder: "Enter Email",
                  errorKey: "email",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className={`font-medium ${darkMode ? "text-white" : "text-black"}`}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={field.disabled}
                    className={`h-9 w-full mt-1 px-3 py-1.5 rounded-lg border bg-transparent ${
                      darkMode ? "text-white border-gray-400" : "bg-white "
                    }`}
                  />
                  {errors[field.errorKey] && (
                    <p className="text-red-500 text-xs">{errors[field.errorKey]}</p>
                  )}
                </div>
              ))}

              {/* Password Field with Strength */}
              <div className="relative">
                <label className={`font-medium ${darkMode ? "text-white" : "text-black"}`}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  placeholder="Enter Password"
                  onChange={(e) => {
                    handleChange(e);
                    const value = e.target.value;
                    const hasUpper = /[A-Z]/.test(value);
                    const hasLower = /[a-z]/.test(value);
                    const hasNumber = /[0-9]/.test(value);
                    if (value.length === 0) setPasswordStrength("");
                    else if (value.length >= 8 && hasUpper && hasLower && hasNumber)
                      setPasswordStrength("strong");
                    else if (value.length >= 6 && ((hasUpper && hasNumber) || (hasLower && hasNumber) || (hasUpper && hasLower)))
                      setPasswordStrength("good");
                    else setPasswordStrength("weak");
                  }}
                  className={`h-9 w-full mt-1 px-3 py-1.5 rounded-lg border pr-10 bg-transparent ${
                    darkMode ? "text-white border-gray-400" : "bg-white"
                  }`}
                />
                <div
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {formData.password.length > 0 && (
                  <>
                    <div className={`h-1 mt-1 rounded-full ${getPasswordStrengthColor()}`}></div>
                    <p className="text-xs mt-1 font-semibold" style={{ color: passwordStrength === "weak" ? "red" : passwordStrength === "good" ? "#eab308" : "green" }}>
                      {passwordStrength.toUpperCase()}
                    </p>
                  </>
                )}
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              {/* ✅ Confirm Password Field */}
            <div className="relative">
                <label className={`font-medium ${darkMode ? "text-white" : "text-black"}`}>Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter Password"
                  className={`h-9 w-full mt-1 px-3 py-1.5 rounded-lg border pr-10 bg-transparent ${
                    darkMode ? "text-white border-gray-400" : "bg-white"
                  }`}
                />
                <div
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                )}
              </div>
              <div>
                <label
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`h-9 w-full mt-1 px-3 py-1.5 rounded-lg border ${
                    darkMode ? "border-gray-400 bg-transparent" : "bg-white"
                  }`}
                >
                  <option value="user" className={`text-black`}>User</option>
                  <option value="admin" className={`text-black`}>Admin</option>
                </select>
              </div>

              <div>
                <label
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`h-9 w-full mt-1 px-3 py-1.5 rounded-lg border ${
                    darkMode ? "border-gray-400 bg-transparent" : "bg-white"
                  }`}
                >
                  <option value="">Select Country</option>
                  {countryList.map((c, i) => (
                    <option key={i} value={c.name} className={`text-black`}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs">{errors.country}</p>
                )}
              </div>

              <div>
                <label
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  Phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className={`h-9 w-24 mt-1 px-2 py-1.5 rounded-lg border bg-transparent ${
                      darkMode ? " border-gray-400" : "bg-white"
                    }`}
                  >
                    {countryList.map((c, i) => (
                      <option key={i} value={c.code} className="text-black">
                        +{c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Phone Number"
                    className={`h-9 flex-1 mt-1 px-3 py-1.5 rounded-lg border bg-transparent ${
                      darkMode ? " border-gray-400" : "bg-white"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">
                  I agree to the terms and conditions
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs">{errors.termsAccepted}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-60"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center bg-cover bg-center bg-white">
          <img src="/LAR.gif" alt="Register" className="object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Register;
