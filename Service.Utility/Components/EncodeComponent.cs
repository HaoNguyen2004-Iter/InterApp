using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Service.Utility.Components
{
    public static class EncodeComponent 
    {
        private static byte[] _salt = Encoding.ASCII.GetBytes("o6806642kbM7c520511");

        private static byte[] ReadByteArray(Stream s)
        {
            byte[] array = new byte[4];
            if (s.Read(array, 0, array.Length) != array.Length)
            {
                throw new SystemException("Stream did not contain properly formatted byte array");
            }
            byte[] array2 = new byte[BitConverter.ToInt32(array, 0)];
            if (s.Read(array2, 0, array2.Length) != array2.Length)
            {
                throw new SystemException("Did not read byte array properly");
            }
            return array2;
        }

        public static string Encrypt(string plainText, string sharedSecret)
        {
            if (string.IsNullOrEmpty(plainText))
            {
                throw new ArgumentNullException("plainText");
            }
            string result = null;
            RijndaelManaged rijndaelManaged = null;
            try
            {
                Rfc2898DeriveBytes rfc2898DeriveBytes = new Rfc2898DeriveBytes(sharedSecret, _salt);
                rijndaelManaged = new RijndaelManaged();
                rijndaelManaged.Key = rfc2898DeriveBytes.GetBytes(rijndaelManaged.KeySize / 8);
                ICryptoTransform transform = rijndaelManaged.CreateEncryptor(rijndaelManaged.Key, rijndaelManaged.IV);
                using MemoryStream memoryStream = new MemoryStream();
                memoryStream.Write(BitConverter.GetBytes(rijndaelManaged.IV.Length), 0, 4);
                memoryStream.Write(rijndaelManaged.IV, 0, rijndaelManaged.IV.Length);
                using (CryptoStream stream = new CryptoStream(memoryStream, transform, CryptoStreamMode.Write))
                {
                    using StreamWriter streamWriter = new StreamWriter(stream);
                    streamWriter.Write(plainText);
                }
                result = Convert.ToBase64String(memoryStream.ToArray());
            }
            catch (Exception)
            {
            }
            finally
            {
                rijndaelManaged?.Clear();
            }
            return result;
        }

        public static string EncryptCurrency(this decimal v, string sharedSecret)
        {
            string text = v.ToString() ?? "";
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException(text);
            }
            return Encrypt(text, sharedSecret);
        }

        public static string Encrypt<T>(this T v, string sharedSecret)
        {  
            string text = JsonSerializer.Serialize(v);
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException(text);
            }
            return Encrypt(text, sharedSecret);
        }

        public static string Decrypt(string cipherText, string sharedSecret)
        {
            if (string.IsNullOrEmpty(cipherText))
            {
                return "";
            }
            RijndaelManaged rijndaelManaged = null;
            string result = null;
            try
            {
                Rfc2898DeriveBytes rfc2898DeriveBytes = new Rfc2898DeriveBytes(sharedSecret, _salt);
                byte[] buffer = Convert.FromBase64String(cipherText);
                using MemoryStream memoryStream = new MemoryStream(buffer);
                rijndaelManaged = new RijndaelManaged();
                rijndaelManaged.Key = rfc2898DeriveBytes.GetBytes(rijndaelManaged.KeySize / 8);
                rijndaelManaged.IV = ReadByteArray(memoryStream);
                ICryptoTransform transform = rijndaelManaged.CreateDecryptor(rijndaelManaged.Key, rijndaelManaged.IV);
                using CryptoStream stream = new CryptoStream(memoryStream, transform, CryptoStreamMode.Read);
                using StreamReader streamReader = new StreamReader(stream);
                result = streamReader.ReadToEnd();
            }
            catch (Exception)
            {
            }
            finally
            {
                rijndaelManaged?.Clear();
            }
            return result;
        }

        public static decimal DecryptCurrency(this string cipherText, string sharedSecret)
        {
            if (string.IsNullOrEmpty(cipherText))
            {
                return 0m;
            }
            string text = Decrypt(cipherText, sharedSecret);
            if (!string.IsNullOrEmpty(text))
            {
                return decimal.Parse(text);
            }
            return 0m;
        }

        public static T Decrypt<T>(this string cipherText, string sharedSecret)
        {
            if (string.IsNullOrEmpty(cipherText))
            {
                return default(T);
            }
            string text = Decrypt(cipherText, sharedSecret);
            try
            {
                if (!string.IsNullOrEmpty(text))
                {
                    T val = JsonSerializer.Deserialize<T>(text);
                    if (val != null)
                    {
                        return val;
                    }
                    return default(T);
                }
            }
            catch (Exception)
            {
                return default(T);
            }
            return default(T);
        }
    }
}
