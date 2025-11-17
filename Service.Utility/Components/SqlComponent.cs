using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq; 
using Service.Utility.Variables;

namespace Service.Utility.Components
{
    public class SqlComponent
    {
        public DatabaseType Db { get; set; }
        public SqlComponent(DatabaseType db)
        {
            Db = db;
        }
        public SqlComponent()
        { 
        }
        private SqlConnection Connection { get; set; }
        public List<DataRow> Select(string query)
        {
            if (Connect())
            {
                try
                {
                    var cmd = Connection.CreateCommand();
                    cmd.CommandText = query;
                    var adap = new SqlDataAdapter(cmd);
                    var result = new DataTable();
                    adap.Fill(result);
                    return result.Rows.OfType<DataRow>().ToList();
                }
                finally
                {
                    Close();
                }
            }
            return null;
        }

        public int Insert(string sqlStr)
        {
            if (Connect())
            {
                try
                {
                    using (var command = Connection.CreateCommand())
                    {
                        command.CommandText = sqlStr;
                        command.ExecuteNonQuery();
                        return (int)command.ExecuteScalar();
                    }
                }
                catch (Exception)
                {
                    return -1;
                }
                finally
                {
                    Close();
                }
            }
            return -1;
        }

        public bool Update(string sql)
        {
            if (Connect())
            {
                try
                {
                    using (var command = Connection.CreateCommand())
                    {
                        command.CommandText = sql;
                        command.ExecuteNonQuery();
                    }
                }
                catch (Exception)
                {
                    // ignored
                    return false;
                }

                finally
                {
                    Close();
                }
                return true;
            }
            return false;
        }

        public bool Delete(string sql)
        {
            if (Connect())
            {
                try
                {
                    using (var command = Connection.CreateCommand())
                    {
                        command.CommandText = sql;
                        command.ExecuteNonQuery();
                    }
                }
                catch (Exception)
                {
                    return false;
                }

                finally
                {
                    Close();
                }
                return true;
            }
            return false;
        }

        public bool Connect()
        { 
            Connection = new SqlConnection("data source=27.0.12.71;initial catalog=Demo_HRM;persist security info=True;user id=minimax;password=minimaxP@P@");
            try
            {
                Connection.Open();
                return true;
            }
            catch (TimeoutException)
            {
                return false;
            }
        }

        public void Close()
        {
            if (Connection.State == ConnectionState.Open)
            {
                Connection.Close();
            }
        }

       
    }

    public static class DynamicSql
    {
        public static IEnumerable<dynamic> DynamicListFromSql(this DbContext db, string sql)
        {
            using (var cmd = db.Database.Connection.CreateCommand())
            {
                cmd.CommandText = sql;
                if (cmd.Connection.State != ConnectionState.Open) { cmd.Connection.Open(); }
                  
                using (var dataReader = cmd.ExecuteReader())
                {
                    while (dataReader.Read())
                    {
                        var row = new ExpandoObject() as IDictionary<string, object>;
                        for (var fieldCount = 0; fieldCount < dataReader.FieldCount; fieldCount++)
                        {
                            row.Add(dataReader.GetName(fieldCount), dataReader[fieldCount]);
                        }
                        yield return row;
                    }
                }
            }
        }
    }
}